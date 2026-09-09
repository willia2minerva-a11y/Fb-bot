// core/commands/commands/AchievementCommands.js
import { BaseCommand } from './BaseCommand.js';

export class AchievementCommands extends BaseCommand {
    getCommands() {
        return {
            'مهام': this.handleDailyTasks.bind(this),
            'مهامي': this.handleDailyTasks.bind(this),
            'يومي': this.handleDailyTasks.bind(this),
            'انجازات': this.handleAchievements.bind(this),
            'إنجازات': this.handleAchievements.bind(this)
        };
    }

    async handleDailyTasks(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const achievementSystem = await this.getSystem('achievement');
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        return await achievementSystem.showDailyTasks(player);
    }

    async handleAchievements(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const achievementSystem = await this.getSystem('achievement');
        if (!achievementSystem) return '❌ نظام الإنجازات غير متوفر.';

        return await achievementSystem.showAchievements(player);
    }
}
