// core/commands/BaseCommand.js
export class BaseCommand {
    constructor(commandHandler) {
        this.commandHandler = commandHandler;
        this.adminSystem = commandHandler.adminSystem;
        this.ARABIC_ITEM_MAP = commandHandler.ARABIC_ITEM_MAP;
    }

    async getSystem(systemName) {
        return this.commandHandler.getSystem(systemName);
    }

    // 🆕 دوال المساعدة المشتركة
    getRegistrationMessage(player) {
        return this.commandHandler.getRegistrationMessage(player);
    }

    getLimitedHelpMenu() {
        return this.commandHandler.getLimitedHelpMenu();
    }

    getLimitedMenu() {
        return this.commandHandler.getLimitedMenu();
    }

    isPlayerApproved(player) {
        return player.isApproved();
    }

    // 🆕 التحقق من صلاحية اللاعب مع رسالة خطأ مناسبة
    async checkPlayerApproval(player) {
        if (!this.isPlayerApproved(player)) {
            return { error: this.getRegistrationMessage(player) };
        }
        return { success: true };
    }

    // 🆕 معالجة الأخطاء المشتركة
    handleError(error, action) {
        console.error(`❌ خطأ في ${action}:`, error);
        return `❌ حدث خطأ أثناء ${action}.`;
    }
}
