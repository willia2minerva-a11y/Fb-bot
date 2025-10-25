// systems/world/TravelSystem.js
import { gates } from '../../data/gates.js';
import { locations } from '../../data/locations.js';
import { items } from '../../data/items.js';

export class TravelSystem {
  constructor() {
    this.gates = gates;
    this.activeGateSessions = new Map();
    this.gateEvents = this.createGateEvents();
    this.gateBosses = this.createGateBosses();
    console.log('🚀 نظام السفر والبوابات تم تهيئته بنجاح');
  }

  // 🆕 نظام الأحداث داخل البوابات
  createGateEvents() {
    return {
      'gate_ed': [
        { 
          type: 'treasure', 
          description: 'عثرت على صندوق كنز مخفي!', 
          rewards: { 'wood': 5, 'stone': 3 } 
        },
        { 
          type: 'resource', 
          description: 'وجدت منطقة غنية بالموارد!', 
          rewards: { 'wood': 3, 'coal': 2 } 
        },
        { 
          type: 'trap', 
          description: '⚠️ لقد وقعت في فخ! خسرت بعض الصحة.', 
          damage: 10 
        }
      ],
      'gate_ba': [
        { 
          type: 'treasure', 
          description: 'كنز ثمين من العصور القديمة!', 
          rewards: { 'copper_ore': 4, 'coal': 3 } 
        },
        { 
          type: 'shrine', 
          description: '🛐 مزار قديم يشفي جراحك.', 
          heal: 25 
        }
      ]
    };
  }

  // 🆕 زعماء البوابات
  createGateBosses() {
    return {
      'gate_ed': {
        id: 'gate_guardian',
        name: 'حارس البوابة',
        level: 5,
        health: 120,
        maxHealth: 120,
        damage: 15,
        defense: 8,
        rewards: { 'wood': 10, 'stone': 8, 'copper_ore': 5, 'experience': 100 }
      },
      'gate_ba': {
        id: 'shadow_warrior', 
        name: 'محارب الظل',
        level: 12,
        health: 200,
        maxHealth: 200, 
        damage: 25,
        defense: 15,
        rewards: { 'iron_ore': 8, 'coal': 6, 'silver_ore': 3, 'experience': 200 }
      }
    };
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

  // 🆕 دخول البوابة مع بدء الجلسة
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

    // بدء جلسة البوابة
    const gateSession = {
      gateId: gate.id,
      playerId: player.userId,
      steps: 0,
      events: [],
      bossDefeated: false,
      startedAt: new Date()
    };

    this.activeGateSessions.set(player.userId, gateSession);

    // حدث أولي
    const initialEvent = this.generateGateEvent(gate.id);
    gateSession.events.push(initialEvent);

    return { 
      message: `🌀 **لقد دخلت ${gate.name}!**\n\n${initialEvent.description}\n\n` +
               `💡 استخدم \`استكشاف\` للمتابعة داخل البوابة!`
    };
  }

  // 🆕 توليد أحداث عشوائية داخل البوابة
  generateGateEvent(gateId) {
    const events = this.gateEvents[gateId] || this.gateEvents['gate_ed'];
    return events[Math.floor(Math.random() * events.length)];
  }

  // 🆕 استكشاف البوابة
  async exploreGate(player) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) {
      return { error: '❌ لست داخل بوابة حالياً.' };
    }

    session.steps++;

    let resultMessage = `📍 **خطوة ${session.steps} في البوابة**\n\n`;

    // فرصة مواجهة الزعيم
    if (!session.bossDefeated && session.steps >= 2 && Math.random() > 0.7) {
      const boss = this.gateBosses[session.gateId];
      if (boss) {
        session.bossDefeated = true;
        return {
          message: `🐉 **مواجهة زعيم البوابة!**\n\n` +
                   `**${boss.name}** يظهر أمامك!\n` +
                   `استخدم \`هجوم\` لبدء القتال!`
        };
      }
    }

    // حدث عادي
    const event = this.generateGateEvent(session.gateId);
    session.events.push(event);
    
    resultMessage += `${event.description}\n`;

    // تطبيق المكافآت
    if (event.rewards) {
      for (const [itemId, quantity] of Object.entries(event.rewards)) {
        player.addItem(itemId, items[itemId]?.name || itemId, 'resource', quantity);
        resultMessage += `🎁 **مكافأة:** ${quantity} ${items[itemId]?.name || itemId}\n`;
      }
    }

    if (event.damage) {
      player.takeDamage(event.damage);
      resultMessage += `💔 **ضرر:** خسرت ${event.damage} صحة\n`;
    }

    if (event.heal) {
      player.heal(event.heal);
      resultMessage += `💚 **شفاء:** استعدت ${event.heal} صحة\n`;
    }

    resultMessage += `\n📊 **حالتك:** ${player.health}/${player.maxHealth} صحة`;

    return { message: resultMessage };
  }

  // 🆕 مغادرة البوابة
  async leaveGate(player) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) {
      return { error: '❌ لست داخل بوابة حالياً.' };
    }

    const gate = this.gates.find(g => g.id === session.gateId);
    this.activeGateSessions.delete(player.userId);

    return {
      message: `🚪 **غادرت ${gate?.name}**\n\n` +
               `📊 **إحصائيات رحلتك:**\n` +
               `• عدد الخطوات: ${session.steps}\n` +
               `• الأحداث: ${session.events.length}\n` +
               `• الزعيم: ${session.bossDefeated ? '☑️ هزمته' : '❌ لم تهزمه'}`
    };
  }

  // 🆕 التحقق من المعركة النشطة
  isPlayerInBattle(playerId, battleSystem) {
    return battleSystem && 
           battleSystem.activeBattles && 
           battleSystem.activeBattles.has(playerId);
  }

  async travelTo(player, locationId, battleSystem = null) {
    // 🆕 منع السفر أثناء القتال
    if (this.isPlayerInBattle(player.userId, battleSystem)) {
      return { error: '⚔️ لا يمكنك التنقل أثناء القتال! استخدم `هروب` أولاً.' };
    }

    const location = locations[locationId];
    if (!location) {
        return { error: '❌ الموقع غير موجود.' };
    }

    if (location.requiredLevel && player.level < location.requiredLevel) {
        return { error: `❌ تحتاج إلى المستوى ${location.requiredLevel} للسفر إلى ${location.name}.` };
    }

    // إنهاء جلسة البوابة إذا كانت نشطة
    this.activeGateSessions.delete(player.userId);

    const previousLocation = player.currentLocation;
    player.currentLocation = locationId;

    return {
        message: `📍 انتقلت من **${this.getLocationName(previousLocation)}** إلى **${location.name}**!\n\n` +
               `📖 ${location.description || 'موقع جديد ينتظر الاستكشاف.'}`
    };
  }
                                          }
