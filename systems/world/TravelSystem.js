// systems/world/TravelSystem.js
import { gates } from '../../data/gates.js';
import { locations } from '../../data/locations.js';

export class TravelSystem {
  constructor() {
    this.gates = gates;
    console.log('🚀 نظام السفر تم تهيئته بنجاح');
  }

  getNearbyGates(player) {
    const currentLocation = player.currentLocation;
    const nearbyGates = this.gates.filter(gate => 
      gate.availableLocations.includes(currentLocation)
    );
    return nearbyGates;
  }

  getLocationName(locationId) {
    return locations[locationId]?.name || locationId;
  }

  async enterGate(player, gateName) {
    const gate = this.gates.find(g => 
      g.name.toLowerCase().includes(gateName.toLowerCase()) ||
      g.id.toLowerCase().includes(gateName.toLowerCase())
    );

    if (!gate) {
      return { error: '❌ لم يتم العثور على هذه البوابة.' };
    }

    if (!gate.availableLocations.includes(player.currentLocation)) {
      return { error: `❌ هذه البوابة غير متاحة في موقعك الحالي (${this.getLocationName(player.currentLocation)}).` };
    }

    if (player.level < gate.requiredLevel) {
      return { error: `❌ تحتاج إلى المستوى ${gate.requiredLevel} على الأقل لدخول ${gate.name}.` };
    }

    const gateLocationId = `gate_${gate.id}`;
    
    player.currentLocation = gateLocationId;
    player.lastGateEntered = gate.id;
    player.lastGateEnteredAt = new Date();

    return { 
      message: `🌀 لقد دخلت **${gate.name}**!\n\n` +
               `📋 **معلومات البوابة:**\n` +
               `• 📊 الخطر: ${'⭐'.repeat(gate.danger)}\n` +
               `• 📍 الوصف: ${gate.description}\n` +
               `• 🎯 المستوى المطلوب: ${gate.requiredLevel}+\n\n` +
               `💡 استخدم أمر "مغامرة" لبدء الاستكشاف داخل البوابة!`
    };
  }

  async travelTo(player, locationId) {
    const location = locations[locationId];
    if (!location) {
        return { error: '❌ الموقع غير موجود.' };
    }

    if (location.requiredLevel && player.level < location.requiredLevel) {
        return { error: `❌ تحتاج إلى المستوى ${location.requiredLevel} للسفر إلى ${location.name}.` };
    }

    const previousLocation = player.currentLocation;
    player.currentLocation = locationId;

    return {
        message: `📍 انتقلت من **${this.getLocationName(previousLocation)}** إلى **${location.name}**!\n\n` +
               `📖 ${location.description || 'موقع جديد ينتظر الاستكشاف.'}`
    };
  }

  getCurrentGateInfo(player) {
    if (!player.currentLocation.startsWith('gate_')) {
      return null;
    }

    const gateId = player.currentLocation.replace('gate_', '');
    return this.gates.find(g => g.id === gateId);
  }
      }
