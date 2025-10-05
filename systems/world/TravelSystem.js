// systems/world/TravelSystem.js
import { locations } from '../../data/locations.js';
import { gates } from '../../data/gates.js';

export class TravelSystem {
  constructor() {
    this.locations = locations;
    this.gates = gates;
  }

  getCurrentLocation(player) {
    // الاعتماد على قيمة الموقع المحفوظة أو 'forest' كافتراضي
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

  // الدالة أصبحت async لحفظ الموديل
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

    const previousLocation = player.currentLocation;
    player.currentLocation = locationId;

    await player.save(); // 💾 حفظ التغيير في قاعدة البيانات

    return {
      success: true,
      message: `🧭 **انتقلت من ${this.getLocationName(previousLocation)} إلى ${targetLocation.name}!**\n\n${targetLocation.description}`,
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
