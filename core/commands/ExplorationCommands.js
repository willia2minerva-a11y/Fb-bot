// core/commands/commands/ExplorationCommands.js
import { BaseCommand } from './BaseCommand.js';
import { locations } from '../../data/locations.js';

export class ExplorationCommands extends BaseCommand {
    getCommands() {
        return {
            'خريطة': this.handleMap.bind(this),
            'خارطة': this.handleMap.bind(this),
            'الموقع': this.handleMap.bind(this),
            'موقعي': this.handleMap.bind(this),
            'ماب': this.handleMap.bind(this),
            'انتقل': this.handleTravel.bind(this),
            'سافر': this.handleTravel.bind(this),
            'سفر': this.handleTravel.bind(this),
            'روح': this.handleTravel.bind(this),
            'اذهب': this.handleTravel.bind(this),
            'ذهاب': this.handleTravel.bind(this),
            'تجميع': this.handleGather.bind(this),
            'اجمع': this.handleGather.bind(this),
            'جمع': this.handleGather.bind(this),
            'موارد': this.handleGather.bind(this)
        };
    }

    getLocationName(locationId) {
        if (!locationId) return 'الغابة';
        return locations[locationId]?.name || locationId;
    }

    async handleMap(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const worldSystem = await this.getSystem('world');
            if (!worldSystem) {
                return '❌ نظام الخريطة غير متوفر حالياً.';
            }

            const result = worldSystem.showMap(player);
            const currentLocationName = this.getLocationName(player.currentLocation);

            if (typeof result === 'string') {
                return result;
            }

            if (result?.message) {
                return result.message;
            }

            return `🗺️ خريطة مغارة غولد

📍 أنت الآن في: ${currentLocationName}

🏠 المناطق:
• الغابة - البداية
• القرية - منطقة آمنة
• الصحراء
• الثلوج
• المحيط
• السماء
• الجحيم

💡 للسفر: انتقل [اسم المكان]`;
        } catch (error) {
            return this.handleError(error, 'عرض الخريطة');
        }
    }

    async handleTravel(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const rawLocationName = args.join(' ').trim();
        if (!rawLocationName) {
            return `❌ اكتب اسم المكان

مثال:
انتقل الصحراء
سافر القرية

💡 للمعرفة: خريطة`;
        }

        const locationId = this.commandHandler?.ARABIC_ITEM_MAP?.[rawLocationName.toLowerCase()] || rawLocationName.toLowerCase();

        try {
            const travelSystem = await this.getSystem('travel');
            if (!travelSystem) {
                return '❌ نظام السفر غير متوفر حالياً.';
            }

            const gateSystem = await this.getSystem('gate');
            const battleSystem = await this.getSystem('battle');

            const result = await travelSystem.travelTo(player, locationId, { gateSystem, battleSystem });

            if (result.error) {
                return result.error;
            }

            await player.save();

            const locationName = this.getLocationName(result.locationId || locationId);
            return result.message || `✅ وصلت إلى ${locationName}`;
        } catch (error) {
            return this.handleError(error, 'السفر');
        }
    }

    async handleGather(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const gatheringSystem = await this.getSystem('gathering');
        if (!gatheringSystem) {
            return '❌ نظام الجمع غير متوفر حالياً.';
        }

        if (args.length === 0) {
            try {
                const result = gatheringSystem.showAvailableResources(player);
                return result.message || '❌ لا توجد موارد متاحة.';
            } catch (error) {
                console.error('❌ خطأ في عرض الموارد:', error);
                return '❌ حدث خطأ في عرض الموارد.';
            }
        }

        const rawResourceName = args.join(' ').trim();
        const resourceId = this.commandHandler?.ARABIC_ITEM_MAP?.[rawResourceName.toLowerCase()] || rawResourceName.toLowerCase();

        const result = await gatheringSystem.gatherResources(player, resourceId);

        if (result.error) {
            return result.error;
        }

        return result.message;
    }
}
