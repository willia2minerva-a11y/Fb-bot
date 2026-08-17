// core/commands/commands/ExplorationCommands.js
import { BaseCommand } from './BaseCommand.js';
import { locations } from '../../data/locations.js';

export class ExplorationCommands extends BaseCommand {
    getCommands() {
        return {
            'خريطة': this.handleMap.bind(this),
            'الموقع': this.handleMap.bind(this),
            'ماب': this.handleMap.bind(this),
            'انتقل': this.handleTravel.bind(this),
            'سافر': this.handleTravel.bind(this),
            'نتقل': this.handleTravel.bind(this),
            'ذهاب': this.handleTravel.bind(this),
            'تجميع': this.handleGather.bind(this),
            'اجمع': this.handleGather.bind(this),
            'جمع': this.handleGather.bind(this)
        };
    }

    async handleMap(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        try {
            const worldSystem = await this.getSystem('world');
            if (!worldSystem) {
                return '❌ نظام الخريطة غير متوفر حالياً.';
            }
            return worldSystem.showMap(player);
        } catch (error) {
            return this.handleError(error, 'عرض الخريطة');
        }
    }

    async handleTravel(player, args) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const rawLocationName = args.join(' ');
        if (!rawLocationName) {
            return '❌ يرجى تحديد اسم المكان. مثال: انتقل الصحراء';
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
            return result.message;
        } catch (error) {
            return this.handleError(error, 'السفر');
        }
    }

    async handleGather(player, args) {
        console.log('🎯 handleGather called');
        console.log('👤 player:', player ? 'exists' : 'null');
        console.log('📍 player.currentLocation:', player?.currentLocation);
        console.log('📝 args:', args);
        
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const gatheringSystem = await this.getSystem('gathering');
        if (!gatheringSystem) {
            return '❌ نظام الجمع غير متوفر حالياً.';
        }
        
        console.log('✅ gatheringSystem loaded');

        if (args.length === 0) {
            console.log('🔍 عرض الموارد المتاحة...');
            try {
                const result = gatheringSystem.showAvailableResources(player);
                console.log('📋 result:', result);
                return result.message || '❌ لا توجد موارد متاحة.';
            } catch (error) {
                console.error('❌ خطأ في showAvailableResources:', error);
                console.error('❌ Stack:', error.stack);
                return '❌ حدث خطأ في عرض الموارد.';
            }
        }

        const rawResourceName = args.join(' ');
        const resourceId = this.commandHandler?.ARABIC_ITEM_MAP?.[rawResourceName.toLowerCase()] || rawResourceName.toLowerCase();
        console.log('🔍 resourceId:', resourceId);

        const result = await gatheringSystem.gatherResources(player, resourceId);

        if (result.error) {
            return result.error;
        }

        return result.message;
    }
            }
