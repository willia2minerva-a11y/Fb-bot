import { locations } from '../../data/locations.js';
import { gates } from '../../data/gates.js';

export class TravelSystem {
  constructor() {
    this.locations = locations;
    this.gates = gates;
  }

  getCurrentLocation(player) {
    const location = this.locations.find(loc => loc.id === player.currentLocation);
    return location || { id: 'village', name: 'القرية', description: 'مكان آمن للراحة' };
  }

  getAvailableLocations(player) {
    return this.locations.filter(loc => 
      loc.requiredLevel <= player.level && 
      !loc.requiredQuest // يمكن إضافة شروط إضافية
    );
  }

  travelTo(player, locationId) {
    const targetLocation = this.locations.find(loc => loc.id === locationId);
    
    if (!targetLocation) {
      return { error: "❌ هذا المكان غير موجود." };
    }

    if (targetLocation.requiredLevel > player.level) {
      return { error: `❌ تحتاج إلى المستوى ${targetLocation.requiredLevel} للوصول إلى ${targetLocation.name}.` };
    }

    const previousLocation = player.currentLocation;
    player.currentLocation = locationId;

    return {
      success: true,
      message: `🧭 **انتقلت من ${this.getLocationName(previousLocation)} إلى ${targetLocation.name}!**\n\n${targetLocation.description}`,
      location: targetLocation
    };
  }

  getLocationName(locationId) {
    const location = this.locations.find(loc => loc.id === locationId);
    return location ? location.name : 'مكان غير معروف';
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
