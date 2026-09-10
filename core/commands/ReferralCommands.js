// core/commands/commands/ReferralCommands.js
import { BaseCommand } from './BaseCommand.js';

export class ReferralCommands extends BaseCommand {
    getCommands() {
        return {
            'دعوة': this.handleReferralInfo.bind(this),
            'كودي': this.handleReferralInfo.bind(this),
            'تفعيل': this.handleUseCode.bind(this),
            'مكافأة': this.handleDailyReward.bind(this),
            'يومي': this.handleDailyReward.bind(this),
            'سلسلة': this.handleStreak.bind(this),
            'streak': this.handleStreak.bind(this)
        };
    }

    async handleReferralInfo(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const referralSystem = await this.getSystem('referral');
        if (!referralSystem) return '❌ نظام الإحالة غير متوفر.';

        return await referralSystem.showReferralInfo(player);
    }

    async handleUseCode(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length === 0) {
            return `❌ اكتب الكود

مثال:
تفعيل MG12345ABC`;
        }

        const code = args[0];

        const referralSystem = await this.getSystem('referral');
        if (!referralSystem) return '❌ نظام الإحالة غير متوفر.';

        const result = await referralSystem.useReferralCode(player, code);
        return result.error || result.message;
    }

    async handleDailyReward(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const referralSystem = await this.getSystem('referral');
        if (!referralSystem) return '❌ نظام المكافآت غير متوفر.';

        const result = await referralSystem.claimDailyReward(player);
        return result.error || result.message;
    }

    async handleStreak(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const referralSystem = await this.getSystem('referral');
        if (!referralSystem) return '❌ نظام السلسلة غير متوفر.';

        return await referralSystem.showDailyStreak(player);
    }
}
