// core/commands/commands/EconomyCommands.js
import { BaseCommand } from '../BaseCommand.js';

export class EconomyCommands extends BaseCommand {
    getCommands() {
        return {
            'سحب': this.handleWithdrawal.bind(this),
            'ايداع': this.handleDeposit.bind(this),
            'تحويل': this.handleTransfer.bind(this),
            'معاملاتي': this.handleTransactions.bind(this),
            'رصيدي': this.handleBalance.bind(this)
        };
    }

    async handleWithdrawal(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) {
            return '❌ يرجى تحديد مبلغ صحيح للسحب. مثال: سحب 100';
        }

        if (amount < 100) {
            return '❌ الحد الأدنى للسحب هو 100 غولد.';
        }

        if (player.gold < amount) {
            return `❌ رصيدك غير كافٍ للسحب.\n💰 رصيدك الحالي: ${player.gold} غولد`;
        }

        // إنشاء طلب سحب
        player.pendingWithdrawal = {
            amount: amount,
            status: 'pending',
            requestedAt: new Date()
        };

        player.gold -= amount;

        // تسجيل المعاملة
        player.transactions.push({
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'withdrawal',
            amount: amount,
            status: 'pending',
            description: `طلب سحب - ${amount} غولد`
        });

        await player.save();

        return `✅ تم تقديم طلب سحب ${amount} غولد بنجاح!\n📋 سيتم معالجته خلال 24 ساعة.\n💎 رصيدك الحالي: ${player.gold} غولد`;
    }

    async handleDeposit(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        return `💳 **طريقة الإيداع:**\n\n` +
               `1. قم بتحويل المبلغ للمدير\n` +
               `2. أرسل إشعار التحويل للمدير\n` +
               `3. سيتم إضافة الغولد خلال 24 ساعة\n\n` +
               `💡 الحد الأدنى للإيداع: 50 غولد\n` +
               `💰 استخدم: "اضافة_غولد [معرفك] [المبلغ]" (للمدير)`;
    }

    async handleTransactions(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const limit = parseInt(args[0]) || 10;
        const transactions = player.transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);

        if (transactions.length === 0) {
            return '📝 لا توجد معاملات سابقة.';
        }

        let history = `📋 **سجل المعاملات (آخر ${transactions.length}):**\n\n`;

        transactions.forEach(transaction => {
            const icons = {
                withdrawal: '💳',
                deposit: '💰',
                transfer_sent: '↗️',
                transfer_received: '↙️'
            };

            const statusIcons = {
                pending: '⏳',
                completed: '✅',
                rejected: '❌'
            };

            const typeNames = {
                withdrawal: 'سحب',
                deposit: 'إيداع',
                transfer_sent: 'تحويل مرسل',
                transfer_received: 'تحويل مستلم'
            };

            history += `${icons[transaction.type] || '💸'} ${statusIcons[transaction.status] || '❓'} `;
            history += `${typeNames[transaction.type] || transaction.type}: ${transaction.amount} غولد\n`;

            if (transaction.targetPlayer) {
                history += `   👤 ${transaction.description}\n`;
            }

            history += `   📅 ${new Date(transaction.createdAt || Date.now()).toLocaleDateString('ar-SA')}\n\n`;
        });

        return history;
    }

    async handleBalance(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        let balanceMessage = `💰 **رصيدك الحالي:** ${player.gold} غولد\n`;
        balanceMessage += `💳 **الحد الأدنى للسحب:** 100 غولد\n`;
        balanceMessage += `📊 **إجمالي المعاملات:** ${player.transactions.length} معاملة\n`;

        if (player.pendingWithdrawal && player.pendingWithdrawal.status === 'pending') {
            balanceMessage += `\n⏳ **طلب سحب معلق:** ${player.pendingWithdrawal.amount} غولد`;
        }

        return balanceMessage;
    }

    async handleTransfer(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length < 2) {
            return '❌ يرجى تحديد لاعب والمبلغ.\nمثال: تحويل @username 50\nمثال: تحويل P476346 50';
        }

        const targetIdentifier = args[0].replace('@', '');
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0) {
            return '❌ يرجى تحديد مبلغ صحيح للتحويل.';
        }

        if (player.gold < amount) {
            return `❌ رصيدك غير كافٍ للتحويل.\n💰 رصيدك: ${player.gold} غولد`;
        }

        try {
            let receiver = await this.findPlayer(targetIdentifier);

            if (!receiver) {
                return `❌ اللاعب المستهدف غير موجود.\n💡 جرب:\n• المعرف التسلسلي (مثل P476346)\n• معرف المستخدم\n• اسم اللاعب الكامل`;
            }

            if (receiver.userId === player.userId) {
                return '❌ لا يمكن التحويل لنفسك.';
            }

            player.gold -= amount;
            receiver.gold += amount;

            const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            player.transactions.push({
                id: transactionId,
                type: 'transfer_sent',
                amount: amount,
                status: 'completed',
                targetPlayer: receiver.userId,
                description: `تحويل إلى ${receiver.name} (${receiver.playerId})`
            });

            receiver.transactions.push({
                id: transactionId,
                type: 'transfer_received',
                amount: amount,
                status: 'completed',
                targetPlayer: player.userId,
                description: `تحويل من ${player.name} (${player.playerId})`
            });

            await player.save();
            await receiver.save();

            return `✅ تم تحويل ${amount} غولد إلى ${receiver.name} (${receiver.playerId}) بنجاح!\n💎 رصيدك الحالي: ${player.gold} غولد`;

        } catch (error) {
            return this.handleError(error, 'التحويل');
        }
    }

    async findPlayer(identifier) {
        const Player = (await import('../Player.js')).default;
        
        let receiver = await Player.findOne({ userId: identifier });
        if (!receiver) {
            receiver = await Player.findOne({ playerId: identifier });
        }
        if (!receiver) {
            receiver = await Player.findOne({ name: identifier });
        }
        if (!receiver) {
            receiver = await Player.findOne({ name: { $regex: new RegExp(identifier, 'i') } });
        }
        
        return receiver;
    }
}