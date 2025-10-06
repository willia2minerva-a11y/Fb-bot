// systems/world/TravelSystem.js
import { locations } from '../../data/locations.js';
import { gates } from '../../data/gates.js';

export class TravelSystem {
  constructor() {
    this.locations = locations;
    this.gates = gates;
  }

  getCurrentLocation(player) {
    const locationId = player.currentLocation || 'forest';
    return this.locations[locationId] || this.locations.forest; 
  }

  getAvailableLocations(player) {
    const allLocations = Object.values(this.locations);
    
    return allLocations.filter(loc => 
      loc.requiredLevel <= player.level && 
      !loc.requiredQuest
    );
  }

  async travelTo(player, locationId) { 
    // 🛠️ إصلاح: محاولة الترجمة العكسية إذا لم يكن المعرف موجوداً
    let targetLocation = this.locations[locationId];
    let originalId = locationId;

    if (!targetLocation) {
        // البحث عن المعرف باستخدام الاسم العربي (كملاذ أخير)
        const foundKey = Object.keys(this.locations).find(key => 
            this.locations[key].name.toLowerCase() === locationId.toLowerCase() ||
            // 🆕 البحث بدون الـ 'ال' التعريف
            (this.locations[key].name.startsWith('ال') && this.locations[key].name.substring(2).toLowerCase() === locationId.toLowerCase())
        );
        targetLocation = this.locations[foundKey];
        if (foundKey) originalId = foundKey;
    }
    // نهاية الإصلاح

    if (!targetLocation) {
      return { error: "❌ هذا المكان غير موجود." };
    }
    
    if (player.currentLocation === originalId) {
        return { error: `أنت بالفعل في ${targetLocation.name}! 🧭`};
    }

    if (targetLocation.requiredLevel > player.level) {
      return { error: `❌ تحتاج إلى المستوى ${targetLocation.requiredLevel} للوصول إلى ${targetLocation.name}.` };
    }
    
    // 1. التحقق من العنصر المطلوب (الأجنحة)
    if (targetLocation.requiredItem) {
        const requiredItemId = targetLocation.requiredItem;
        const hasRequiredItem = player.getItemQuantity(requiredItemId) > 0 || 
                                Object.values(player.equipment).includes(requiredItemId);
        
        if (!hasRequiredItem) {
            return { error: `❌ تحتاج إلى **${requiredItemId}** للدخول إلى ${targetLocation.name}! (قم بصناعتها أو العثور عليها).` };
        }
    }
    
    // 2. التحقق من النشاط
    const cost = targetLocation.staminaCost || 10; 
    const actualStamina = player.getActualStamina();

    if (actualStamina < cost) {
        const missingStamina = cost - actualStamina;
        const recoveryRate = 5; 
        const timeToRecover = Math.ceil(missingStamina / recoveryRate);
        
        return { 
            error: `😩 أنت متعب جداً! التنقل يتطلب ${cost} نشاط، لديك ${Math.floor(actualStamina)} فقط.\n⏳ ستستعيد النشاط الكافي في حوالي ${timeToRecover} دقيقة.` 
        };
    }
    
    // 3. خصم النشاط وتنفيذ السفر
    player.useStamina(cost);
    const previousLocation = player.currentLocation;
    player.currentLocation = originalId;

    await player.save();

    return {
      success: true,
      // رسالة منسقة
      message: `✅ تم التنقل بنجاح!\n🧭 انتقلت من ${this.getLocationName(previousLocation)} إلى ${targetLocation.name}.\n- تم خصم ${cost} نشاط.\n\n📝 وصف الموقع:\n${targetLocation.description}`,
      location: targetLocation
    };
  }

  getLocationName(locationId) {
    const location = this.locations[locationId];
    return location ? location.name : (this.locations.forest.name || 'مكان غير معروف');
  }

  getNearbyGates(player) {
    const currentLocation = this.getCurrentLocation(player);
    return this.gates.filter(gate => 
      gate.availableLocations.includes(currentLocation.id)
    );
  }

  enterGate(player, gateId) {
    const gate = this.gates.find(g => g.id === gateId);
    
    if (!gate) {
      return { error: "❌ هذه البوابة غير موجودة." };
    }

    if (gate.requiredLevel > player.level) {
      return { error: `❌ تحتاج إلى المستوى ${gate.requiredLevel} لدخول ${gate.name}.` };
    }

    return {
      success: true,
      message: `🚪 دخلت **${gate.name}**!\n\n${gate.description}\n\nالوحوش المحتملة: ${gate.monsters.join(', ')}`,
      gate: gate
    };
  }
}
