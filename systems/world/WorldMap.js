export class WorldMap {
    constructor(travelSystem) {
        this.travelSystem = travelSystem;
        console.log('🗺️ الخريطة تم تهيئتها');
    }

    showMap(player) {
        // 🛠️ إصلاح: استخدام getCurrentLocation إذا كان موجوداً، وإلا استخدام currentLocation مباشرة
        const currentLocation = player.getCurrentLocation ? player.getCurrentLocation() : (player.currentLocation || 'القرية');
        
        return `🗺️ **خريطة مغارة غولد**

📍 **المواقع المتاحة:**
• 🏠 القرية (منطقة آمنة) - البداية والتجارة
• 🌲 الغابة الخضراء (مستوى خطر: منخفض) - خشب، أعشاب
• ⛰️ جبال الظلام (مستوى خطر: متوسط) - حجارة، معادن  
• 🐉 كهوف التنين (مستوى خطر: عالي) - كنوز، كريستالات

أنت في: **${currentLocation}**

💡 **للانتقال:** استخدم أمر "انتقل [اسم المكان]"`;
    }

    // 🆕 دالة مساعدة للحصول على مواقع اللعبة
    getLocations() {
        return {
            'القرية': { danger: 0, resources: ['wood', 'herbs'], safeZone: true },
            'الغابة الخضراء': { danger: 1, resources: ['wood', 'herbs', 'berries'], safeZone: false },
            'جبال الظلام': { danger: 2, resources: ['ore', 'gems', 'crystals'], safeZone: false },
            'كهوف التنين': { danger: 3, resources: ['dragon_scale', 'ancient_artifacts'], safeZone: false }
        };
    }

    // 🆕 التحقق مما إذا كان الموقع موجوداً
    isValidLocation(location) {
        const locations = this.getLocations();
        return locations.hasOwnProperty(location);
    }

    // 🆕 الحصول على معلومات موقع معين
    getLocationInfo(location) {
        const locations = this.getLocations();
        return locations[location] || null;
    }
}
