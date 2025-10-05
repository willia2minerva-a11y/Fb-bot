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
    const targetLocation = this.locations[locationId];
    
    if (!targetLocation) {
      return { error: "❌ هذا المكان غير موجود." };
    }
    
    if (player.currentLocation === locationId) {
        return { error: `أنت بالفعل في **${targetLocation.name}**! 🧭`};
    }

    if (targetLocation.requiredLevel > player.level) {
      return { error: `❌ تحتاج إلى المستوى ${targetLocation.requiredLevel} للوصول إلى ${targetLocation.name}.` };
    }
    
    // ===========================================
    // 🆕 التحقق من شرط العنصر المطلوب (الأجنحة)
    // ===========================================
    if (targetLocation.requiredItem) {
        const requiredItemId = targetLocation.requiredItem;
        // التحقق مما إذا كان العنصر موجوداً في المخزون أو مجهزاً (يفترض أن getItemQuantity تعيد 1 إذا كان مجهزاً)
        const hasRequiredItem = player.getItemQuantity(requiredItemId) > 0 || 
                                player.equipment.weapon === requiredItemId ||
                                player.equipment.armor === requiredItemId ||
                                player.equipment.tool === requiredItemId;
        
        if (!hasRequiredItem) {
            return { error: `❌ تحتاج إلى **${requiredItemId}** للدخول إلى **${targetLocation.name}**! (قم بصناعتها أو العثور عليها).` };
        }
    }
    // ===========================================

    // ===========================================
    // 🆕 تطبيق نظام النشاط (Stamina Check)
    // ===========================================
    const cost = targetLocation.staminaCost || 10; 
    const actualStamina = player.getActualStamina();

    if (actualStamina < cost) {
        const missingStamina = cost - actualStamina;
        const recoveryRate = 5; 
        const timeToRecover = Math.ceil(missingStamina / recoveryRate);
        
        return { 
            error: `😩 **أنت متعب جداً!** التنقل يتطلب ${cost} نشاط، لديك ${Math.floor(actualStamina)} فقط.\n⏳ ستستعيد النشاط الكافي في حوالي ${timeToRecover} دقيقة.` 
        };
    }
    
    player.useStamina(cost);
    // ===========================================

    const previousLocation = player.currentLocation;
    player.currentLocation = locationId;

    await player.save();

    return {
      success: true,
      message: `🧭 **انتقلت من ${this.getLocationName(previousLocation)} إلى ${targetLocation.name}!**\n\n- تم خصم **${cost}** نشاط.\n\n${targetLocation.description}`,
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
      message: `🚪 **دخلت ${gate.name}!**\n\n${gate.description}\n\nالوحوش المحتملة: ${gate.monsters.join(', ')}`,
      gate: gate
    };
  }
}
