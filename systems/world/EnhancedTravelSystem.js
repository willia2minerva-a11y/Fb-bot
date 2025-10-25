// systems/world/EnhancedTravelSystem.js
import { gates } from '../../data/gates.js';
import { locations } from '../../data/locations.js';
import { monsters } from '../../data/monsters.js';

export class EnhancedTravelSystem {
  constructor() {
    this.gates = gates;
    this.gateEvents = this.createGateEvents();
    this.gateBosses = this.createGateBosses();
    this.activeGateSessions = new Map();
    console.log('🚀 نظام البوابات المحسن تم تهيئته بنجاح');
  }

  createGateEvents() {
    return {
      'gate_ed': [
        { type: 'treasure', description: 'عثرت على صندوق كنز مخفي!', rewards: { 'wood': 5, 'stone': 3 } },
        { type: 'resource', description: 'وجدت منطقة غنية بالموارد!', rewards: { 'wood': 3, 'coal': 2 } },
        { type: 'trap', description: '⚠️ لقد وقعت في فخ! خسرت بعض الصحة.', damage: 10 },
        { type: 'mystery', description: '🌌 غرفة غامضة... شيء ما يتحرك في الظلام.' }
      ],
      'gate_ba': [
        { type: 'treasure', description: 'كنز ثمين من العصور القديمة!', rewards: { 'copper_ore': 4, 'coal': 3 } },
        { type: 'resource', description: 'منجم صغير مليء بالخامات!', rewards: { 'iron_ore': 3, 'stone': 4 } },
        { type: 'shrine', description: '🛐 مزار قديم يشفي جراحك.', heal: 25 },
        { type: 'ambush', description: '💥 كمين! مجموعة من الوحوش تهاجمك!' }
      ],
      'gate_as': [
        { type: 'treasure', description: 'كنز سحري نادر!', rewards: { 'silver_ore': 3, 'soul_of_light': 1 } },
        { type: 'resource', description: 'غرفة الكريستالات السحرية!', rewards: { 'gold_ore': 2, 'crystal': 2 } },
        { type: 'library', description: '📚 مكتبة قديمة تعلمك مهارة جديدة!', experience: 50 },
        { type: 'boss_room', description: '🐉 غرفة الزعيم! استعد للمواجهة النهائية.' }
      ]
    };
  }

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
      },
      'gate_as': {
        id: 'ancient_dragon',
        name: 'التنين القديم',
        level: 25,
        health: 400,
        maxHealth: 400,
        damage: 45,
        defense: 25,
        rewards: { 'gold_ore': 6, 'soul_of_light': 2, 'dragon_scale': 1, 'experience': 500 }
      }
    };
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
    // التحقق من المعركة النشطة
    if (this.isPlayerInBattle(player.userId)) {
      return { error: '⚔️ لا يمكنك دخول البوابة أثناء القتال! استخدم `هروب` أولاً.' };
    }

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

    // حدث أولي عند الدخول
    const initialEvent = this.generateGateEvent(gate.id, player);
    gateSession.events.push(initialEvent);

    return { 
      message: `🌀 **لقد دخلت ${gate.name}!**\n\n${initialEvent.description}\n\n💡 استخدم \`استكشاف\` للمتابعة أو \`مغادرة\` للخروج.`
    };
  }

  generateGateEvent(gateId, player) {
    const events = this.gateEvents[gateId] || this.gateEvents['gate_ed'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    // تعديل الأحداث بناءً على مستوى اللاعب
    if (randomEvent.type === 'boss_room' && player.level < 10) {
      return this.generateGateEvent(gateId, player); // إعادة توليد حدث إذا كان المستوى منخفض
    }
    
    return randomEvent;
  }

  async exploreGate(player) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) {
      return { error: '❌ لست داخل بوابة حالياً.' };
    }

    // التحقق من المعركة النشطة
    if (this.isPlayerInBattle(player.userId)) {
      return { error: '⚔️ لا يمكنك الاستكشاف أثناء القتال! استخدم `هجوم` أو `هروب` أولاً.' };
    }

    session.steps++;

    // فرصة مواجهة الزعيم بعد خطوات معينة
    if (!session.bossDefeated && session.steps >= 3) {
      const bossChance = Math.random();
      if (bossChance > 0.7) { // 30% فرصة لمواجهة الزعيم
        return this.triggerBossBattle(player, session.gateId);
      }
    }

    // توليد حدث عادي
    const event = this.generateGateEvent(session.gateId, player);
    session.events.push(event);

    let resultMessage = `📍 **خطوة ${session.steps} في ${this.gates.find(g => g.id === session.gateId)?.name}**\n\n`;
    resultMessage += `${event.description}\n\n`;

    // تطبيق تأثيرات الحدث
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

    if (event.experience) {
      player.addExperience(event.experience);
      resultMessage += `✨ **خبرة:** ربحت ${event.experience} نقطة خبرة\n`;
    }

    resultMessage += `\n📊 **حالتك:** ${player.health}/${player.maxHealth} صحة\n`;
    resultMessage += `💡 استخدم \`استكشاف\` للمتابعة أو \`مغادرة\` للخروج.`;

    return { message: resultMessage };
  }

  triggerBossBattle(player, gateId) {
    const boss = this.gateBosses[gateId];
    if (!boss) return { error: '❌ خطأ في تحميل زعيم البوابة.' };

    // بدء معركة مع الزعيم
    const battleSystem = this.getBattleSystem();
    if (battleSystem) {
      battleSystem.startBossBattle(player, boss);
    }

    return {
      message: `🐉 **مواجهة زعيم البوابة!**\n\n` +
               `**${boss.name}** يهاجمك!\n` +
               `❤️ **صحة الزعيم:** ${boss.health}/${boss.maxHealth}\n` +
               `⚔️ **قوته:** ${boss.damage} ضرر\n` +
               `🛡️ **دفاعه:** ${boss.defense}\n\n` +
               `💡 استخدم \`هجوم\` للقتال أو \`هروب\` للفرار!`
    };
  }

  async leaveGate(player) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) {
      return { error: '❌ لست داخل بوابة حالياً.' };
    }

    // التحقق من المعركة النشطة
    if (this.isPlayerInBattle(player.userId)) {
      return { error: '⚔️ لا يمكنك مغادرة البوابة أثناء القتال! استخدم `هروب` أولاً.' };
    }

    const gate = this.gates.find(g => g.id === session.gateId);
    this.activeGateSessions.delete(player.userId);

    let rewardMessage = '';
    if (session.bossDefeated) {
      rewardMessage = `\n🎉 **تهانينا! هزمت زعيم البوابة وحصلت على مكافآت خاصة!**`;
    }

    return {
      message: `🚪 **غادرت ${gate?.name}**\n\n` +
               `📊 **إحصائيات رحلتك:**\n` +
               `• عدد الخطوات: ${session.steps}\n` +
               `• الأحداث: ${session.events.length}\n` +
               `• الزعيم: ${session.bossDefeated ? '☑️ هزمته' : '❌ لم تهزمه'}\n` +
               rewardMessage
    };
  }

  async completeBossBattle(player, bossId) {
    const session = this.activeGateSessions.get(player.userId);
    if (session) {
      session.bossDefeated = true;
      
      const boss = Object.values(this.gateBosses).find(b => b.id === bossId);
      if (boss && boss.rewards) {
        let rewardMessage = `🎉 **تهانينا! هزمت ${boss.name}!**\n\n🎁 **المكافآت:**\n`;
        
        for (const [itemId, quantity] of Object.entries(boss.rewards)) {
          player.addItem(itemId, items[itemId]?.name || itemId, 'resource', quantity);
          rewardMessage += `• ${quantity} ${items[itemId]?.name || itemId}\n`;
        }
        
        return { message: rewardMessage };
      }
    }
    
    return { message: '🎉 تهانينا! هزمت الزعيم!' };
  }

  isPlayerInBattle(playerId) {
    const battleSystem = this.getBattleSystem();
    return battleSystem && battleSystem.activeBattles && battleSystem.activeBattles.has(playerId);
  }

  getBattleSystem() {
    // هذه الدالة تحتاج إلى استيراد نظام القتال
    try {
      const { BattleSystem } = require('../battle/BattleSystem.js');
      return BattleSystem.getInstance();
    } catch (error) {
      console.log('❌ نظام القتال غير متوفر');
      return null;
    }
  }

  async travelTo(player, locationId) {
    // التحقق من المعركة النشطة
    if (this.isPlayerInBattle(player.userId)) {
      return { error: '⚔️ لا يمكنك التنقل أثناء القتال! استخدم `هروب` أولاً.' };
    }

    const location = locations[locationId];
    if (!location) {
        return { error: '❌ الموقع غير موجود.' };
    }

    if (location.requiredLevel && player.level < location.requiredLevel) {
        return { error: `❌ تحتاج إلى المستوى ${location.requiredLevel} للسفر إلى ${location.name}.` };
    }

    const previousLocation = player.currentLocation;
    player.currentLocation = locationId;

    // إذا كان اللاعب في بوابة، إنهاء الجلسة
    this.activeGateSessions.delete(player.userId);

    return {
        message: `📍 انتقلت من **${this.getLocationName(previousLocation)}** إلى **${location.name}**!\n\n` +
               `📖 ${location.description || 'موقع جديد ينتظر الاستكشاف.'}`
    };
  }
}
