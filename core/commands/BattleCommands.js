// core/commands/commands/BattleCommands.js
import { BaseCommand } from '../BaseCommand.js';

export class BattleCommands extends BaseCommand {
    getCommands() {
        return {
            'مغامرة': this.handleAdventure.bind(this),
            'قتال': this.handleAdventure.bind(this),
            'معركة': this.handleAdventure.bind(this),
            'مواجهة': this.handleAdventure.bind(this),
            'هجوم': this.handleAttack.bind(this),
            'اضرب': this.handleAttack.bind(this),
            'هروب': this.handleEscape.bind(this),
            'اهرب': this.handleEscape.bind(this)
        };
    }

    async handleAdventure(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const battleSystem = await this.getSystem('battle');
        if (!battleSystem) {
            return '❌ نظام القتال غير متوفر حالياً.';
        }

        // 🆕 التحقق من وجود اللاعب في بوابة
        const gateSystem = await this.getSystem('gate');
        if (gateSystem && gateSystem.isPlayerInsideGate(player.userId)) {
            return '🚪 لا يمكنك بدء معركة عادية وأنت داخل بوابة! استخدم `استكشف` داخل البوابة.';
        }

        const result = await battleSystem.startBattle(player);

        if (result.error) {
            return result.error;
        }

        return result.message;
    }

    async handleAttack(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const battleSystem = await this.getSystem('battle');
        if (!battleSystem) {
            return '❌ نظام القتال غير متوفر حالياً.';
        }

        const result = await battleSystem.attack(player);

        if (result.error) {
            return result.error;
        }

        return result.message;
    }

    async handleEscape(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const battleSystem = await this.getSystem('battle');
        if (!battleSystem) {
            return '❌ نظام القتال غير متوفر حالياً.';
        }

        const result = await battleSystem.escape(player);

        if (result.error) {
            return result.error;
        }

        return result.message;
    }
}