// systems/world/TravelSystem.js
import { gates } from '../../data/gates.js';
import { locations } from '../../data/locations.js';

export class TravelSystem {
  constructor() {
    this.gates = gates;
  }

  getNearbyGates(player) {
    const currentLocation = player.currentLocation;
    return this.gates.filter(gate => 
      gate.availableLocations.includes(currentLocation)
    );
  }

  getLocationName(locationId) {
    return locations[locationId]?.name || locationId;
  }

  async enterGate(player, gateName) {
    // البحث عن البوابة المطابقة
    const gate = this.gates.find(g => 
      g.name.toLowerCase().includes(gateName.toLowerCase()) ||
      g.id.toLowerCase().includes(gateName.toLowerCase())
    );

    if (!gate) {
      return { error: '❌ لم يتم العثور على هذه البوابة.' };
    }

    // التحقق من الموقع
    if (!gate.availableLocations.includes(player.currentLocation)) {
      return { error: `❌ هذه البوابة غير متاحة في موقعك الحالي (${this.getLocationName(player.currentLocation)}).` };
    }

    // التحقق من المستوى
    if (player.level < gate.requiredLevel) {
      return { error: `❌ تحتاج إلى المستوى ${gate.requiredLevel} على الأقل لدخول ${gate.name}.` };
    }

    // إنشاء موقع البوابة الديناميكي
    const gateLocationId = `gate_${gate.id}`;
    
    // حفظ موقع البوابة في حالة اللاعب
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
    // التحقق من أن اللاعب ليس في قتال نشط
    const battleSystem = await getSystem('battle');
    if (battleSystem && battleSystem.activeBattles.has(player.userId)) {
        const activeMonster = battleSystem.activeBattles.get(player.userId);
        return { 
            error: `⚔️ لا يمكنك التنقل أثناء القتال!\nأنت تقاتل ${activeMonster.name} حالياً.\nاستخدم \`هجوم\` أو \`هروب\` أولاً.` 
        };
    }

    // البحث عن الموقع
    const location = locations[locationId];
    if (!location) {
        return { error: '❌ الموقع غير موجود.' };
    }

    // التحقق من متطلبات الموقع
    if (location.requiredLevel && player.level < location.requiredLevel) {
        return { error: `❌ تحتاج إلى المستوى ${location.requiredLevel} للسفر إلى ${location.name}.` };
    }

    // تحديث موقع اللاعب
    const previousLocation = player.currentLocation;
    player.currentLocation = locationId;
    await player.save();

    return {
        message: `📍 انتقلت من **${this.getLocationName(previousLocation)}** إلى **${location.name}**!\n\n` +
               `📖 ${location.description || 'موقع جديد ينتظر الاستكشاف.'}`
    };
}

async enterGate(player, gateName) {
    // التحقق من أن اللاعب ليس في قتال نشط
    const battleSystem = await getSystem('battle');
    if (battleSystem && battleSystem.activeBattles.has(player.userId)) {
        const activeMonster = battleSystem.activeBattles.get(player.userId);
        return { 
            error: `⚔️ لا يمكنك دخول البوابات أثناء القتال!\nأنت تقاتل ${activeMonster.name} حالياً.\nاستخدم \`هجوم\` أو \`هروب\` أولاً.` 
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
