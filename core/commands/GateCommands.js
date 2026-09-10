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
            'دخل': this.handleEnterGate.bind(this),
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

    _getLocationName(locationId) {
        if (!locationId) return 'الغابة';
        return locations[locationId]?.name || locationId;
    }

    async handleGates(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            // إذا كان اللاعب داخل بوابة، عرض معلوماتها
            if (gateSystem.isPlayerInsideGate(player.userId)) {
                const sessionInfo = gateSystem.getSessionInfo(player);
                if (!sessionInfo.error) {
                    return `🚪 أنت داخل بوابة حالياً!\n\n${sessionInfo.message}\n\n💡 استخدم "بوابتي" لمزيد من التفاصيل`;
                }
            }

            // استخدام دالة العرض الجديدة من GateSystem
            if (typeof gateSystem.showNearbyGates === 'function') {
                return await gateSystem.showNearbyGates(player);
            }

            // احتياطي إذا لم تكن الدالة موجودة
            const nearbyGates = gateSystem.getNearbyGates(player);
            const locationName = this._getLocationName(player.currentLocation);

            if (nearbyGates.length === 0) {
                return `🚪 البوابات القريبة\n\n📍 موقعك: ${locationName}\n\n❌ لا توجد بوابات متاحة حالياً.\n💡 انتقل إلى موقع آخر: انتقل [مكان]`;
            }

            let message = `🚪 البوابات القريبة\n\n📍 موقعك: ${locationName}\n`;

            nearbyGates.forEach((gate, index) => {
                const dangerStars = '⭐'.repeat(gate.danger || 1) + '☆'.repeat(5 - (gate.danger || 1));
                message += `\n${index + 1}. ${gate.name}\n`;
                message += `   📊 ${dangerStars} (مستوى ${gate.requiredLevel}+)\n`;
                message += `   ✅ متاح\n`;
                message += `   📖 ${gate.description || 'بوابة غامضة'}\n`;
            });

            message += `\n💡 الأوامر:\n`;
            message += `• ادخل [اسم البوابة]\n`;
            message += `• بوابتي - معلومات البوابة الحالية\n`;
            message += `• استكشف - الاستكشاف داخل البوابة\n`;
            message += `• اختر [رقم] - اختيار مسار\n`;
            message += `• مغادرة - مغادرة البوابة`;

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
            return `❌ حدد اسم البوابة

مثال:
ادخل بوابة المبتدئين
ادخل بوابة الأساطير

💡 استخدم "بوابات" لرؤية المتاح.`;
        }

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            if (gateSystem.isPlayerInsideGate(player.userId)) {
                return '❌ أنت داخل بوابة أخرى حالياً!\nاستخدم "مغادرة" أولاً.';
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
                return '❌ لست داخل بوابة.\nاستخدم "ادخل [اسم البوابة]" أولاً.';
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
            return `❌ حدد رقم الخيار

مثال:
اختر 1
اختر 2`;
        }

        const choiceNumber = args[0];

        try {
            const gateSystem = await this.getSystem('gate');
            if (!gateSystem) {
                return '❌ نظام البوابات غير متوفر حالياً.';
            }

            if (!gateSystem.isPlayerInsideGate(player.userId)) {
                return '❌ لست داخل بوابة.\nاستخدم "ادخل [اسم البوابة]" أولاً.';
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
