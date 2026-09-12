// core/commands/EconomyCommands.js
import { BaseCommand } from './BaseCommand.js';

export class EconomyCommands extends BaseCommand {
    getCommands() {
        return {
            'رصيد': this.handleBalance.bind(this),
            'رصيدي': this.handleBalance.bind(this),
            // ✅ كل أمر اقتصادي آخر يتم توجيهه لسوق ريو
            'سحب': this.handleRedirect.bind(this),
            'تحويل': this.handleRedirect.bind(this),
            'حول': this.handleRedirect.bind(this),
            'متجر': this.handleRedirect.bind(this),
            'المتجر': this.handleRedirect.bind(this),
            'شراء': this.handleRedirect.bind(this),
            'اشتري': this.handleRedirect.bind(this),
            'هدية': this.handleRedirect.bind(this),
            'كود': this.handleRedirect.bind(this),
            'خصم': this.handleRedirect.bind(this),
            'كوبون': this.handleRedirect.bind(this),
            'معاملاتي': this.handleRedirect.bind(this),
            'سجلي': this.handleRedirect.bind(this),
            'ايداع': this.handleRedirect.bind(this),
            'إيداع': this.handleRedirect.bind(this),
            'بطاقة': this.handleRedirect.bind(this),
            'بطاقتي': this.handleRedirect.bind(this),
            'منتج': this.handleRedirect.bind(this),
            'تفاصيل': this.handleRedirect.bind(this)
        };
    }

    // ✅ عرض الرصيد والتوجيه للسوق
    async handleBalance(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const marketUrl = this.commandHandler?.marketPageUrl || 'https://facebook.com/souqrio';

        return `💰 رصيدك

💎 الرصيد: ${player.gold} ريو
📊 المستوى: ${player.level}
🆔 المعرف: ${player.playerId || player.userId}

⚠️ لاستخدام رصيدك (الشراء، التحويل، إلخ):
🛒 توجه إلى سوق ريو
🔗 ${marketUrl}

📋 أوامر السوق:
• متجر - عرض المنتجات
• شراء [ID] - شراء منتج
• تحويل [الاسم] [المبلغ] - تحويل ريو
• هدية [الكود] - استخدام كود هدية
• خصم [الكود] - كود خصم
• بطاقة - بطاقة رصيدك
• معاملاتي - سجل معاملاتك`;
    }

    // ✅ توجيه أي أمر اقتصادي
    async handleRedirect(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const marketUrl = this.commandHandler?.marketPageUrl || 'https://facebook.com/souqrio';

        return `🛒 هذا الأمر متاح في سوق ريو

🔗 توجه إلى:
${marketUrl}

💡 أوامر السوق المتاحة:
• رصيد - عرض رصيدك
• متجر - عرض المنتجات
• شراء [ID] - شراء منتج
• تحويل [الاسم] [المبلغ]
• هدية [الكود]
• خصم [الكود]
• بطاقة
• معاملاتي`;
    }
}
