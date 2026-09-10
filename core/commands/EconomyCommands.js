// core/commands/EconomyCommands.js
import { BaseCommand } from './BaseCommand.js';

export class EconomyCommands extends BaseCommand {
    getCommands() {
        return {
            'رصيدي': this.handleBalance.bind(this),
            'رصيد': this.handleBalance.bind(this),
            'سحب': this.handleWithdraw.bind(this),
            'ايداع': this.handleDepositInfo.bind(this),
            'إيداع': this.handleDepositInfo.bind(this),
            'معاملاتي': this.handleTransactions.bind(this)
        };
    }

    // ✅ رصيد اللاعب
    async handleBalance(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        return `💰 رصيدك

💎 الغولد: ${player.gold}
📊 المستوى: ${player.level}

💡 للسحب: سحب [المبلغ]
💡 للإيداع: ايداع`;
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

        const adminLink = this.commandHandler?.adminProfileUrl || 'https://www.facebook.com/';
        const adminName = this.commandHandler?.adminDisplayName || 'المدير';

        return `💎 الإيداع في البوت

📖 كيف يعمل الإيداع:
• تدفع المبلغ للإدارة في مجموعة غولد الرسمية
• يتم إضافة الغولد لرصيدك في البوت
• يمكنك استخدامه للشراء أو السحب

📌 خطوات الإيداع:
1. تواصل مع ${adminName} عبر الرابط:
${adminLink}

2. أخبره بالمبلغ الذي تريد إيداعه
3. أكمل عملية الدفع معه
4. سيقوم بإضافة الغولد لرصيدك

💰 رصيدك الحالي: ${player.gold} غولد

⚠️ ملاحظة:
• الإيداع يتم يدوياً من قبل الإدارة
• تأكد من التعامل مع الإدارة الرسمية فقط
• لا ترسل أي مبالغ لأي شخص آخر`;
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
            const icon = tx.type === 'deposit' ? '📥' : '📤';

            msg += `\n${icon} ${tx.description}\n`;
            msg += `   💰 ${tx.amount} غولد\n`;
            msg += `   📅 ${date}\n`;
            msg += `   📊 ${tx.status === 'completed' ? '✅ مكتمل' : tx.status === 'pending' ? '⏳ معلق' : '❌ مرفوض'}\n`;
        });

        return msg;
    }
}
