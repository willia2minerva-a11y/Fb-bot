// core/commands/commands/GateCommands.js
import { BaseCommand } from './BaseCommand.js';
import { locations } from '../../data/locations.js';

export class GateCommands extends BaseCommand {
    getCommands() {
        return {
            'بوابات': this.handleGates.bind(this),
            'بوابتي': this.handleGateInfo.bind(this),
            'معلومات_البوابة': this.handleGateInfo.bind(this),
            'ادخل': this.handleEnterGate.bind(this),
            'استكشاف': this.handleExploreGate.bind(this),
            'استكشف': this.handleExploreGate.bind(this),
            'مغادرة': this.handleLeaveGate.bind(this),
            'غادر': this.handleLeaveGate.bind(this),
            'اختر': this.handleGateChoice.bind(this),
            'انتقي': this.handleGateChoice.bind(this),
            'مسار': this.handleGateChoice.bind(this),
            'قرار': this.handleGateChoice.bind(this)
        };
    }

    async handleGates(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            if (gateSystem.isPlayerInsideGate(player.userId)) {
                const sessionInfo = gateSystem.getSessionInfo(player);
                if (!sessionInfo.error) {
                    return `🚪 **أنت داخل بوابة حالياً!**\n\n${sessionInfo.message}\n\n💡 استخدم "بوابتي" لمزيد من التفاصيل`;
                }
            }

            const nearbyGates = gateSystem.getNearbyGates(player);

            if (nearbyGates.length === 0) {
                return `🚪 لا توجد بوابات نشطة حالياً في **${locations[player.currentLocation]?.name || player.currentLocation}**!\n💡 انتقل إلى موقع آخر أو ارتفع مستواك.`;
            }

            let message = `╔══════════ 🚪 البوابات القريبة ══════════╗\n\n`;
            message += `📍 **موقعك:** ${locations[player.currentLocation]?.name || player.currentLocation}\n\n`;

            nearbyGates.forEach((gate, index) => {
                const dangerStars = '⭐'.repeat(gate.danger) + '☆'.repeat(5 - gate.danger);
                const status = player.level >= gate.requiredLevel ? '✅ متاح' : '❌ تحتاج مستوى أعلى';

                message += `**${index + 1}. ${gate.name}**\n`;
                message += `   📊 ${dangerStars} (مستوى ${gate.requiredLevel}+)\n`;
                message += `   🎯 ${status}\n`;
                message += `   📖 ${gate.description}\n\n`;
            });

            message += `💡 **الأوامر:**\n`;
            message += `• "ادخل [اسم البوابة]" - دخول بوابة\n`;
            message += `• "بوابتي" - معلومات البوابة الحالية\n`;
            message += `• "استكشف" - الاستكشاف داخل البوابة\n`;
            message += `• "اختر [رقم]" - اختيار مسار في القصة\n`;
            message += `• "مغادرة" - مغادرة البوابة\n`;

            return message;
        } catch (error) {
            return this.handleError(error, 'عرض البوابات');
        }
    }

    async handleGateInfo(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            const result = gateSystem.getSessionInfo(player);
            if (result.error) {
                return result.error;
            }

            return result.message;
        } catch (error) {
            return this.handleError(error, 'جلب معلومات البوابة');
        }
    }

    async handleEnterGate(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const gateName = args.join(' ');
        if (!gateName) {
            return `❌ يرجى تحديد اسم البوابة.\n💡 مثال: ادخل بوابة سولو\n💡 استخدم "بوابات" لرؤية البوابات المتاحة.`;
        }

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            if (gateSystem.isPlayerInsideGate(player.userId)) {
                return '❌ أنت داخل بوابة أخرى حالياً! استخدم "مغادرة" أولاً.';
            }

            const result = await gateSystem.enterGate(player, gateName);
            if (result.error) {
                return result.error;
            }

            await player.save();
            return result.message;
        } catch (error) {
            return this.handleError(error, 'دخول البوابة');
        }
    }

    async handleExploreGate(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            if (!gateSystem.isPlayerInsideGate(player.userId)) {
                return '❌ لست داخل بوابة حالياً. استخدم "ادخل [اسم البوابة]" أولاً.';
            }

            const result = await gateSystem.exploreGate(player);
            if (result.error) {
                return result.error;
            }

            await player.save();
            return result.message;
        } catch (error) {
            return this.handleError(error, 'استكشاف البوابة');
        }
    }

    async handleLeaveGate(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            if (!gateSystem.isPlayerInsideGate(player.userId)) {
                return '❌ لست داخل بوابة حالياً.';
            }

            const result = await gateSystem.leaveGate(player);
            if (result.error) {
                return result.error;
            }

            await player.save();
            return result.message;
        } catch (error) {
            return this.handleError(error, 'مغادرة البوابة');
        }
    }

    async handleGateChoice(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        if (args.length === 0) {
            return `❌ يرجى تحديد رقم الخيار.\n💡 مثال: اختر 1\n💡 مثال: اختر 2`;
        }

        const choiceNumber = args[0];

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            if (!gateSystem.isPlayerInsideGate(player.userId)) {
                return '❌ لست داخل بوابة حالياً. استخدم "ادخل [اسم البوابة]" أولاً.';
            }

            const result = await gateSystem.handleChoice(player, choiceNumber);
            if (result.error) {
                return result.error;
            }

            await player.save();
            return result.message;
        } catch (error) {
            return this.handleError(error, 'معالجة الاختيار');
        }
    }
}
