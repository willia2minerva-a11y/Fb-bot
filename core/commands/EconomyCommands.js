// core/commands/commands/EconomyCommands.js
import { BaseCommand } from './BaseCommand.js';

export class EconomyCommands extends BaseCommand {
    getCommands() {
        return {
            'رصيدي': this.handleBalance.bind(this),
            'رصيد': this.handleBalance.bind(this),
            'سحب': this.handleWithdraw.bind(this),
            'ايداع': this.handleDepositInfo.bind(this),
            'تحويل': this.handleTransfer.bind(this),
            'معاملاتي': this.handleTransactions.bind(this),
            // ✅ أوامر الأدمن الجديدة
            'اقتصاد': this.handleEconomyStats.bind(this),
            'اغنياء': this.handleRichestPlayers.bind(this),
            'فقراء': this.handlePoorestPlayers.bind(this),
            'طلبات_سحب': this.handlePendingWithdrawals.bind(this),
            'اقتصاد_لاعب': this.handlePlayerEconomy.bind(this)
        };
    }

    // ✅ رصيد اللاعب
    async handleBalance(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        return `💰 رصيدك

💎 الغولد: ${player.gold}
📊 المستوى: ${player.level}

💡 للتحويل: تحويل [اسم اللاعب] [المبلغ]
💡 للسحب: سحب [المبلغ]`;
    }

    // ✅ طلب سحب
    async handleWithdraw(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) {
            return `❌ اكتب مبلغاً صحيحاً.

مثال: سحب 100

💰 رصيدك: ${player.gold} غولد`;
        }

        if (amount > player.gold) {
            return `❌ رصيدك غير كافٍ!

💰 رصيدك: ${player.gold} غولد
📊 المطلوب: ${amount} غولد`;
        }

        if (amount < 50) {
            return `❌ الحد الأدنى للسحب: 50 غولد`;
        }

        const result = player.requestWithdrawal(amount);
        if (result.error) return result.error;

        await player.save();

        return `✅ تم إرسال طلب السحب

💸 المبلغ: ${amount} غولد
💰 رصيدك الجديد: ${player.gold} غولد

⏳ انتظر موافقة المدير.`;
    }

    // ✅ معلومات الإيداع
    async handleDepositInfo(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        return `💰 الإيداع

💡 للتواصل مع الإدارة حول الإيداع، راسل الأدمن.

📊 رصيدك الحالي: ${player.gold} غولد`;
    }

    // ✅ تحويل
    async handleTransfer(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length < 2) {
            return `❌ الاستخدام: تحويل [اسم اللاعب] [المبلغ]

مثال: تحويل Ahmed 100`;
        }

        const amount = parseInt(args[args.length - 1]);
        const targetName = args.slice(0, -1).join(' ');

        if (!amount || amount <= 0) {
            return '❌ مبلغ غير صالح.';
        }

        if (amount > player.gold) {
            return `❌ رصيدك غير كافٍ!

💰 رصيدك: ${player.gold} غولد`;
        }

        const Player = (await import('../../Player.js')).default;
        const target = await Player.findOne({
            name: { $regex: new RegExp(`^${targetName}$`, 'i') }
        });

        if (!target) {
            return `❌ لم يتم العثور على اللاعب: ${targetName}`;
        }

        if (target.userId === player.userId) {
            return '❌ لا يمكنك التحويل لنفسك!';
        }

        player.gold -= amount;
        target.gold += amount;

        player.transactions.push({
            id: `tx_${Date.now()}`,
            type: 'transfer_sent',
            amount: amount,
            status: 'completed',
            targetPlayer: target.name,
            description: `تحويل إلى ${target.name}`
        });

        target.transactions.push({
            id: `tx_${Date.now()}`,
            type: 'transfer_received',
            amount: amount,
            status: 'completed',
            targetPlayer: player.name,
            description: `تحويل من ${player.name}`
        });

        await player.save();
        await target.save();

        return `✅ تم التحويل بنجاح!

💸 المبلغ: ${amount} غولد
👤 إلى: ${target.name}
💰 رصيدك الجديد: ${player.gold} غولد`;
    }

    // ✅ سجل المعاملات
    async handleTransactions(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const transactions = player.getTransactionHistory(10);

        if (transactions.length === 0) {
            return `📋 سجل المعاملات

❌ لا توجد معاملات حالياً.`;
        }

        let msg = `📋 سجل المعاملات (آخر ${transactions.length})\n`;

        transactions.forEach(tx => {
            const date = new Date(tx.createdAt).toLocaleDateString('ar-EG');
            const icon = tx.type === 'deposit' ? '📥' :
                        tx.type === 'withdrawal' ? '📤' :
                        tx.type === 'transfer_sent' ? '➡️' : '⬅️';

            msg += `\n${icon} ${tx.description}\n`;
            msg += `   💰 ${tx.amount} غولد\n`;
            msg += `   📅 ${date}\n`;
            msg += `   📊 ${tx.status === 'completed' ? '✅ مكتمل' : tx.status === 'pending' ? '⏳ معلق' : '❌ مرفوض'}\n`;
        });

        return msg;
    }

    // ===================================
    // ✅ أوامر الأدمن الاقتصادية
    // ===================================

    async handleEconomyStats(player) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const economySystem = await this.getSystem('economy');
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';

        return await economySystem.showEconomyStats();
    }

    async handleRichestPlayers(player, args) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const page = parseInt(args[0]) || 1;

        const economySystem = await this.getSystem('economy');
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';

        return await economySystem.showRichestPlayers(page);
    }

    async handlePoorestPlayers(player, args) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const page = parseInt(args[0]) || 1;

        const economySystem = await this.getSystem('economy');
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';

        return await economySystem.showPoorestPlayers(page);
    }

    async handlePendingWithdrawals(player, args) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const page = parseInt(args[0]) || 1;

        const economySystem = await this.getSystem('economy');
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';

        return await economySystem.showPendingWithdrawals(page);
    }

    async handlePlayerEconomy(player, args) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        if (args.length === 0) {
            return `❌ الاستخدام: اقتصاد_لاعب [اسم اللاعب]

مثال: اقتصاد_لاعب Ahmed`;
        }

        const playerName = args.join(' ');

        const economySystem = await this.getSystem('economy');
        if (!economySystem) return '❌ نظام الاقتصاد غير متوفر.';

        return await economySystem.showPlayerEconomy(playerName);
    }
}
