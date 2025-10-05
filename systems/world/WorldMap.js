// systems/world/WorldMap.js
export class WorldMap {
    constructor(travelSystem) {
        this.travelSystem = travelSystem;
        console.log('🗺️ الخريطة تم تهيئتها');
    }

    showMap(player) {
        // استخدام getLocationName للحصول على اسم الموقع العربي من نظام الانتقال
        const currentLocationInfo = this.travelSystem.getLocationName(player.currentLocation);
        
        return `🗺️ **خريطة مغارة غولد**

📍 **المواقع الرئيسية المتاحة:**
• 🌲 الغابات (خطر: 1/5) - نقطة البداية الافتراضية
• 🏠 القرية (منطقة آمنة) - التجارة والاستراحة
• 🏜️ الصحراء (خطر: 2/5)
• 🌨️ الثلوج (خطر: 2/5)
• 🌌 السماء (خطر: 3/5)
• 🌊 المحيط (خطر: 3/5)
• 🐉 الغابة الجوفية (خطر: 4/5)
• 🏰 المعبد القديم/القلاع (خطر: 4/5 - 5/5)
• 🔥 الجحيم (خطر: 5/5)

أنت في: **${currentLocationInfo}**

💡 **للانتقال:** استخدم أمر "انتقل [اسم المكان]" أو "بوابات" لاستعراض البوابات المتاحة حولك.`;
    }

    // 🆕 دالة مساعدة للحصول على مواقع اللعبة (تم تحديثها لتشمل المناطق الجديدة فقط)
    getLocations() {
        return {
            'القرية': { danger: 0, resources: [], safeZone: true },
            'الغابات': { danger: 1, resources: ['wood', 'mushroom'], safeZone: false },
            'الصحراء': { danger: 2, resources: ['sand', 'cactus'], safeZone: false },
            'الثلوج': { danger: 2, resources: ['ice', 'snow'], safeZone: false },
            'السماء': { danger: 3, resources: ['celestial_crystals'], safeZone: false },
            'المحيط': { danger: 3, resources: ['shells', 'pearl'], safeZone: false },
            'المعبد القديم': { danger: 4, resources: ['sacred_stones'], safeZone: false },
            'الغابة الجوفية': { danger: 4, resources: ['chlorophyte'], safeZone: false },
            'الجحيم': { danger: 5, resources: ['fire_gems', 'hellstone'], safeZone: false },
            'معابد الغابة': { danger: 5, resources: ['golden_bricks'], safeZone: false },
            'المعبد القمري': { danger: 5, resources: ['lunar_crystals'], safeZone: false },
            'القلعة السحرية': { danger: 5, resources: ['spell_books'], safeZone: false },
            'القلاع المظلمة': { danger: 5, resources: ['trapped_souls'], safeZone: false },
            'قلعة الحاكم': { danger: 5, resources: ['royal_treasures'], safeZone: false }
        };
    }

    // الدوال المساعدة للتحقق من الموقع
    isValidLocation(location) {
        const locations = this.getLocations();
        return locations.hasOwnProperty(location);
    }

    getLocationInfo(location) {
        const locations = this.getLocations();
        return locations[location] || null;
    }
}
