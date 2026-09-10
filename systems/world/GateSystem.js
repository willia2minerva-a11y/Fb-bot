// systems/world/GateSystem.js
import { gates } from '../../data/gates.js';
import { locations } from '../../data/locations.js';
import { items } from '../../data/items.js';

// ✅ قاموس ترجمة أسماء البوابات للعربية
const GATE_NAMES_AR = {
  // فئات البوابات الرئيسية
  'gate_ed': 'بوابة المبتدئين',
  'gate_dc': 'بوابة التدريب',
  'gate_cb': 'بوابة المغامرين',
  'gate_ba': 'بوابة المحترفين',
  'gate_as': 'بوابة الأبطال',
  'gate_s': 'بوابة الأساطير',
  'gate_a': 'بوابة النخبة',
  'gate_ca': 'بوابة المتقدمين',
  'gate_ab': 'بوابة الفرسان',
  'gate_td': 'البوابة الديناميكية',
  
  // بوابات سولو
  'solo_tier_1': 'بوابة الوحيد - المبتدئ',
  'solo_tier_2': 'بوابة الوحيد - المتقدم',
  'solo_tier_3': 'بوابة الوحيد - الخبير',
  'solo_tier_boss': 'بوابة الوحيد - الزعيم',
  
  // خريطة المواقع
  'e_d_gates': 'بوابات المبتدئين',
  'd_c_gates': 'بوابات التدريب',
  'c_b_gates': 'بوابات المغامرين',
  'b_a_gates': 'بوابات المحترفين',
  'a_s_gates': 'بوابات الأبطال',
  's_rank_gates': 'بوابات الأساطير',
  'a_gates': 'بوابات النخبة',
  'c_a_gates': 'بوابات المتقدمين',
  'a_b_gates': 'بوابات الفرسان'
};

export class GateSystem {
  constructor({ battleSystem = null } = {}) {
    this.gates = gates;
    this.activeGateSessions = new Map();
    this.battleSystem = battleSystem;
    this.gateBosses = this._createGateBosses();
    this.gateEvents = this._createGateEvents();
    console.log('🚪 GateSystem جاهز (قِصصي ومتوافق مع BattleSystem)');
  }

  // ✅ الحصول على الاسم العربي للبوابة
  _getGateNameArabic(gate) {
    if (!gate) return 'بوابة';
    // إذا كان للبوابة اسم عربي في بياناتها، استخدمه
    if (gate.name) return gate.name;
    // وإلا ابحث في القاموس
    return GATE_NAMES_AR[gate.id] || gate.id;
  }

  _getLocationNameArabic(locationId) {
    const locationNames = {
      'forest': 'الغابة', 'desert': 'الصحراء', 'mountain': 'الجبل',
      'cave': 'الكهف', 'plains': 'السهول', 'snow': 'الثلوج',
      'sky': 'السماء', 'ocean': 'المحيط', 'river': 'النهر',
      'hell': 'الجحيم', 'jungle': 'الغابة الاستوائية',
      'underground_jungle': 'الغابة الجوفية', 'village': 'القرية'
    };
    return locationNames[locationId] || locationId;
  }

  _createGateEvents() {
    return {
      gate_ed: [
        {
          type: 'narrative',
          description: 'عبرت ممرًا مظلماً ووجدت طريقين: واحد ضيق وآخر على جسر مضيء.',
          choices: ['انزل', 'اعبر الجسر'],
          choiceHandler: this._handlePathChoice.bind(this)
        },
        {
          type: 'treasure',
          description: 'عثرت على صندوق كنز!',
          rewards: { wood: 5, stone: 3 }
        },
        {
          type: 'trap',
          description: '⚠️ لقد وقعت في فخ! خسرت بعض الصحة.',
          damage: 10
        }
      ],
      solo_tier_1: [
        {
          type: 'narrative',
          description: 'داخل البوابة طرق متفرعة — مسار هادئ وآخر تردد عليه أصوات.',
          choices: ['اتجه نحو الأصوات', 'اتجه نحو الهدوء'],
          choiceHandler: this._handleSoloTier1Choice.bind(this)
        },
        {
          type: 'combat',
          description: 'مجموعة من الكائنات الضعيفة تهاجم!',
          monsters: ['weak_slime']
        },
        {
          type: 'resource',
          description: 'بقعة جوهر! تحصل على جوهر ضعيف.',
          rewards: { weak_essence: 3 }
        }
      ],
      solo_tier_3: [
        {
          type: 'narrative',
          description: 'الخطوات تتعرّض لهزات أرضية — يبدو أن قلب البوابة قريب.',
          choices: ['تابع ببطء', 'اندفع للأمام'],
          choiceHandler: this._handleSoloTier3Choice.bind(this)
        },
        {
          type: 'trap',
          description: 'فخ أرضي قوي! خسرت جزءًا كبيرًا من الصحة.',
          damage: 30
        }
      ],
      gate_td: [
        {
          type: 'narrative',
          description: 'بوابة التدريب الديناميكية تفتح أمامك مسارات متعددة.',
          choices: ['المسار الآمن', 'المسار الخطير'],
          choiceHandler: this._handleTDChoice.bind(this)
        },
        {
          type: 'treasure',
          description: 'عثرت على مخبأ موارد تدريب!',
          rewards: { wood: 8, stone: 5, iron_ore: 3 }
        },
        {
          type: 'combat',
          description: 'مخلوقات تدريبية تظهر لاختبار مهاراتك!',
          monsters: ['slime', 'low_level_goblin']
        }
      ]
    };
  }

  _handlePathChoice(player, session, choice) {
    let result = { message: '' };

    if (choice === 'انزل') {
      result.message = 'نزلت عبر الممر الضيق وعثرت على غرفة سرية تحت الأرض!';
      result.rewards = { iron_ore: 3, stone: 5 };
    } else if (choice === 'اعبر الجسر') {
      result.message = 'عبرت الجسر المضيء وشاهدت منظراً رائعاً من الأعلى!';
      result.rewards = { wood: 8, experience: 25 };
    }

    return result;
  }

  _handleSoloTier1Choice(player, session, choice) {
    let result = { message: '' };

    if (choice === 'اتجه نحو الأصوات') {
      result.message = 'اتجهت نحو الأصوات وواجهت مجموعة من الغوبلن!';
      result.combat = true;
      result.monsters = ['small_goblin', 'small_goblin'];
    } else if (choice === 'اتجه نحو الهدوء') {
      result.message = 'اتجهت نحو الهدوء وعثرت على مورد ثمين!';
      result.rewards = { weak_essence: 5, wood: 10 };
    }

    return result;
  }

  _handleSoloTier3Choice(player, session, choice) {
    let result = { message: '' };

    if (choice === 'تابع ببطء') {
      result.message = 'تقدّمت بحذر وتجنبت العديد من الأفخاخ!';
      result.rewards = { essence_core: 1, experience: 100 };
    } else if (choice === 'اندفع للأمام') {
      result.message = 'اندفعت للأمام بسرعة لكنك وقعت في فخ!';
      result.damage = 20;
      result.rewards = { essence_core: 2, experience: 150 };
    }

    return result;
  }

  _handleTDChoice(player, session, choice) {
    let result = { message: '' };

    if (choice === 'المسار الآمن') {
      result.message = 'اخترت المسار الآمن وحصلت على موارد تدريب!';
      result.rewards = { wood: 10, stone: 8, experience: 50 };
    } else if (choice === 'المسار الخطير') {
      result.message = 'اخترت المسار الخطير وواجهت تحديًا!';
      result.combat = true;
      result.monsters = ['slime', 'wild_boar'];
      result.rewards = { wood: 15, stone: 12, iron_ore: 5, experience: 100 };
    }

    return result;
  }

  _createGateBosses() {
    return {
      gate_ed: { id: 'gate_guardian', name: 'حارس البوابة', level: 5, health: 120, maxHealth: 120, damage: 15, defense: 8, rewards: { wood: 10, stone: 8, experience: 100 } },
      gate_ba: { id: 'shadow_warrior', name: 'محارب الظل', level: 12, health: 200, maxHealth: 200, damage: 25, defense: 15, rewards: { iron_ore: 8, experience: 200 } },
      solo_tier_boss: { id: 'solo_tier_boss_entity', name: 'زعيم بوابة سولُو', level: 55, health: 1200, maxHealth: 1200, damage: 80, defense: 40, rewards: { supreme_essence: 2, unique_armor_part: 1, experience: 2000 } },
      gate_td: { id: 'training_guardian', name: 'حارس التدريب', level: 8, health: 150, maxHealth: 150, damage: 20, defense: 10, rewards: { wood: 15, stone: 12, iron_ore: 8, experience: 150 } }
    };
  }

  getGate(query) {
    if (!query) return null;
    const q = query.toLowerCase();

    // البحث بالمعرف أو الاسم
    let gate = this.gates.find(g => g.id.toLowerCase() === q || g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q));

    // ✅ البحث بالاسم العربي
    if (!gate) {
      for (const [id, arabicName] of Object.entries(GATE_NAMES_AR)) {
        if (arabicName.toLowerCase().includes(q)) {
          gate = this.gates.find(g => g.id === id);
          if (gate) break;
        }
      }
    }

    return gate;
  }

  isPlayerInsideGate(userId) {
    return this.activeGateSessions.has(userId);
  }

  getNearbyGates(player) {
    const currentLocation = player.currentLocation;
    return this.gates.filter(gate =>
      gate.availableLocations.includes(currentLocation) &&
      player.level >= gate.requiredLevel
    );
  }

  // ✅ عرض البوابات القريبة (بدون نجوم)
  async showNearbyGates(player) {
    const nearby = this.getNearbyGates(player);
    const locationName = this._getLocationNameArabic(player.currentLocation);

    if (nearby.length === 0) {
      return `🚪 البوابات القريبة\n\n📍 موقعك: ${locationName}\n\n❌ لا توجد بوابات متاحة في موقعك حالياً.\n\n💡 جرب السفر إلى مكان آخر: انتقل [مكان]`;
    }

    let msg = `🚪 البوابات القريبة\n\n📍 موقعك: ${locationName}\n`;

    nearby.forEach((gate, index) => {
      const gateName = this._getGateNameArabic(gate);
      const stars = this._getStarRating(gate.requiredLevel);

      msg += `\n${index + 1}. ${gateName}\n`;
      msg += `   📊 ${stars} (مستوى ${gate.requiredLevel || 1}+)\n`;
      msg += `   ✅ متاح\n`;
      msg += `   📖 ${gate.description || 'بوابة غامضة تنتظر الاستكشاف'}\n`;
    });

    msg += `\n💡 الأوامر:\n`;
    msg += `• ادخل [اسم البوابة]\n`;
    msg += `• بوابتي - معلومات البوابة الحالية\n`;
    msg += `• استكشف - داخل البوابة\n`;
    msg += `• اختر [رقم] - اختيار مسار\n`;
    msg += `• مغادرة - مغادرة البوابة`;

    return msg;
  }

  _getStarRating(level) {
    if (level >= 100) return '⭐⭐⭐⭐⭐';
    if (level >= 80) return '⭐⭐⭐⭐☆';
    if (level >= 60) return '⭐⭐⭐☆☆';
    if (level >= 40) return '⭐⭐☆☆☆';
    if (level >= 20) return '⭐☆☆☆☆';
    return '☆☆☆☆☆';
  }

  async enterGate(player, gateQuery) {
    if (this.battleSystem && this.battleSystem.activeBattles && this.battleSystem.activeBattles.has(player.userId)) {
      return { error: '⚔️ لا يمكنك دخول البوابة أثناء وجودك في قتال.' };
    }
    const gate = this.getGate(gateQuery);
    if (!gate) return { error: '❌ لم يتم العثور على هذه البوابة.' };
    if (!gate.availableLocations.includes(player.currentLocation)) {
      const locationName = this._getLocationNameArabic(player.currentLocation);
      return { error: `❌ هذه البوابة غير موجودة في موقعك الحالي (${locationName}).` };
    }
    if (player.level < (gate.requiredLevel || 0)) {
      return { error: `❌ تحتاج للمستوى ${gate.requiredLevel} لدخول ${this._getGateNameArabic(gate)}.` };
    }
    if (this.isPlayerInsideGate(player.userId)) return { error: '🚪 أنت داخل بوابة أخرى حالياً.' };

    const session = {
      gateId: gate.id,
      playerId: player.userId,
      steps: 0,
      events: [],
      bossDefeated: false,
      awaitingBossCombat: false,
      startedAt: new Date(),
      closed: false,
      currentEvent: null
    };
    this.activeGateSessions.set(player.userId, session);

    const ev = this._generateEvent(gate.id);
    session.events.push(ev);
    session.currentEvent = ev;

    const gateName = this._getGateNameArabic(gate);
    let msg = `🌀 لقد دخلت ${gateName}!\n\n${ev.description}\n\n`;

    if (ev.choices && ev.choices.length > 0) {
      msg += `🛤️ الخيارات المتاحة:\n`;
      ev.choices.forEach((choice, index) => {
        msg += `${index + 1}. ${choice}\n`;
      });
      msg += `\n💡 استخدم: اختر [رقم]`;
    } else {
      msg += '💡 استخدم "استكشف" للاستمرار.';
    }

    return { message: msg, session };
  }

  _generateEvent(gateId) {
    const list = this.gateEvents[gateId] || this.gateEvents['gate_ed'] || [];
    if (!list.length) return { type: 'narrative', description: 'الممر هادئ...' };
    return list[Math.floor(Math.random() * list.length)];
  }

  async exploreGate(player) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) return { error: '❌ لست داخل بوابة حالياً.' };
    if (session.closed) return { error: '✅ هذه البوابة مغلقة.' };

    if (session.currentEvent && session.currentEvent.choices && session.currentEvent.choices.length > 0) {
      return { error: '❌ يجب اتخاذ قرار أولاً! استخدم "اختر [رقم]".' };
    }

    session.steps++;

    const gateDef = this.gates.find(g => g.id === session.gateId);
    const boss = this.gateBosses[session.gateId] || null;

    const threshold = boss ? Math.max(2, Math.floor(Math.random() * 3) + 2) : 999;
    if (!session.bossDefeated && boss && session.steps >= threshold && Math.random() > 0.5) {
      session.awaitingBossCombat = true;
      if (this.battleSystem && typeof this.battleSystem.startBattleWithMonster === 'function') {
        const bossCopy = Object.assign({}, boss);
        bossCopy.meta = { gateId: session.gateId, isGateBoss: true };
        const startRes = await this.battleSystem.startBattleWithMonster(player, bossCopy, { isGateBoss: true, gateId: session.gateId });
        return { message: `🐉 الزعيم يظهر: ${boss.name}!\n${startRes.message || ''}` };
      } else {
        return { message: `🐉 ${boss.name} يظهر أمامك!` };
      }
    }

    const ev = this._generateEvent(session.gateId);
    session.events.push(ev);
    session.currentEvent = ev;

    let msg = `📍 خطوة ${session.steps}: ${ev.description}\n\n`;

    if (ev.rewards) {
      for (const [itemId, qty] of Object.entries(ev.rewards)) {
        if (itemId === 'experience') {
          player.addExperience(qty);
          msg += `✨ +${qty} خبرة\n`;
        } else {
          if (typeof player.addItem === 'function') player.addItem(itemId, items[itemId]?.name || itemId, 'resource', qty);
          msg += `🎁 +${qty} × ${items[itemId]?.name || itemId}\n`;
        }
      }
    }
    if (ev.damage) {
      if (typeof player.takeDamage === 'function') player.takeDamage(ev.damage);
      msg += `💔 خسرت ${ev.damage} صحة.\n`;
    }
    if (ev.heal) {
      if (typeof player.heal === 'function') player.heal(ev.heal);
      msg += `💚 استعدت ${ev.heal} صحة.\n`;
    }

    if (ev.choices && ev.choices.length > 0) {
      msg += `\n🛤️ الخيارات المتاحة:\n`;
      ev.choices.forEach((choice, index) => {
        msg += `${index + 1}. ${choice}\n`;
      });
      msg += `\n💡 استخدم: اختر [رقم]`;
    } else {
      msg += `\n📊 صحتك: ${Math.floor(player.health)} / ${player.maxHealth}`;
      msg += `\n💡 استخدم "استكشف" للاستمرار.`;
    }

    return { message: msg };
  }

  async handleChoice(player, choiceNumber) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) return { error: '❌ لست داخل بوابة حالياً.' };

    const currentEvent = session.currentEvent;
    if (!currentEvent || !currentEvent.choices || currentEvent.choices.length === 0) {
      return { error: '❌ لا توجد خيارات متاحة حالياً.' };
    }

    const choiceIndex = parseInt(choiceNumber) - 1;
    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentEvent.choices.length) {
      return { error: `❌ رقم غير صحيح. الخيارات من 1 إلى ${currentEvent.choices.length}` };
    }

    const selectedChoice = currentEvent.choices[choiceIndex];

    let result;
    if (currentEvent.choiceHandler) {
      result = currentEvent.choiceHandler(player, session, selectedChoice);
    } else {
      result = { message: `✅ اخترت: ${selectedChoice}` };
    }

    if (result.rewards) {
      for (const [itemId, qty] of Object.entries(result.rewards)) {
        if (itemId === 'experience') {
          player.addExperience(qty);
          result.message += `\n✨ +${qty} خبرة`;
        } else {
          if (typeof player.addItem === 'function') {
            player.addItem(itemId, items[itemId]?.name || itemId, 'resource', qty);
          }
          result.message += `\n🎁 +${qty} × ${items[itemId]?.name || itemId}`;
        }
      }
    }

    if (result.damage) {
      if (typeof player.takeDamage === 'function') {
        player.takeDamage(result.damage);
      }
      result.message += `\n💔 خسرت ${result.damage} صحة.`;
    }

    if (result.combat && this.battleSystem && typeof this.battleSystem.startBattleWithMonsters === 'function') {
      const combatResult = await this.battleSystem.startBattleWithMonsters(player, result.monsters);
      result.message += `\n\n${combatResult.message || '⚔️ بدأت المعركة!'}`;
    }

    session.currentEvent = null;

    result.message += `\n\n📊 صحتك: ${Math.floor(player.health)} / ${player.maxHealth}`;
    result.message += `\n💡 استخدم "استكشف" للمتابعة.`;

    return result;
  }

  async onBossDefeated(player, gateId, battleResult = {}) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session || session.gateId !== gateId) {
      for (const s of this.activeGateSessions.values()) {
        if (s.playerId === player.userId && s.gateId === gateId) {
          s.bossDefeated = true;
          s.closed = true;
          break;
        }
      }
      return { error: 'جلسة البوابة غير موجودة.' };
    }

    session.bossDefeated = true;
    session.closed = true;
    session.currentEvent = null;

    const gate = this.gates.find(g => g.id === gateId);
    const drops = gate?.drops || {};
    let msg = `🏆 هزمت زعيم ${this.gateBosses[gateId]?.name || this._getGateNameArabic(gate)}!\n\n`;

    if (drops && Object.keys(drops).length) {
      for (const [itemId, qty] of Object.entries(drops)) {
        if (itemId !== 'experience') {
          if (typeof player.addItem === 'function') {
            player.addItem(itemId, items[itemId]?.name || itemId, 'boss_drop', qty);
          }
          msg += `🎁 +${qty} × ${items[itemId]?.name || itemId}\n`;
        }
      }
    }

    const bossRewards = this.gateBosses[gateId]?.rewards;
    if (bossRewards) {
      for (const [itemId, qty] of Object.entries(bossRewards)) {
        if (itemId !== 'experience') {
          if (typeof player.addItem === 'function') {
            player.addItem(itemId, items[itemId]?.name || itemId, 'boss_reward', qty);
          }
          msg += `🏆 +${qty} × ${items[itemId]?.name || itemId}\n`;
        }
      }
    }

    const exp = battleResult.experience || (drops.experience || 0) || (this.gateBosses[gateId]?.rewards?.experience || 0);
    if (exp && typeof player.addExperience === 'function') player.addExperience(exp);
    if (exp) msg += `✨ +${exp} خبرة\n`;

    this.activeGateSessions.delete(player.userId);

    msg += `\n🎉 أكملت البوابة بنجاح!\n📊 إجمالي الخطوات: ${session.steps}`;

    return { message: msg };
  }

  async leaveGate(player, force = false) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) return { error: '❌ لست داخل بوابة.' };

    if (session.awaitingBossCombat && !force) {
      return { error: '⚔️ لا يمكنك المغادرة الآن — الزعيم ظهر، ابدأ القتال أو استخدم هروب.' };
    }
    if (force && typeof player.useStamina === 'function') {
      const penalty = Math.min(player.getActualStamina ? player.getActualStamina() : (player.activityPoints || player.stamina || 0), 10 + (session.steps || 0));
      player.useStamina(penalty);
    }

    const steps = session.steps;
    const gate = this.gates.find(g => g.id === session.gateId);
    const gateName = this._getGateNameArabic(gate);
    this.activeGateSessions.delete(player.userId);

    return { message: `🚪 غادرت ${gateName}\n📊 إجمالي الخطوات: ${steps}` };
  }

  getSessionInfo(player) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) return { error: '❌ لست داخل بوابة.' };

    const gate = this.gates.find(g => g.id === session.gateId);
    const gateName = this._getGateNameArabic(gate);

    let info = `🚪 معلومات البوابة الحالية\n`;
    info += `• البوابة: ${gateName}\n`;
    info += `• الخطوات: ${session.steps}\n`;
    info += `• الحالة: ${session.closed ? 'مغلقة' : session.awaitingBossCombat ? 'في مواجهة زعيم' : 'نشطة'}\n`;

    if (session.currentEvent && session.currentEvent.choices && session.currentEvent.choices.length > 0) {
      info += `\n🛤️ خيارات متاحة:\n`;
      session.currentEvent.choices.forEach((choice, index) => {
        info += `${index + 1}. ${choice}\n`;
      });
      info += `\n💡 استخدم "اختر [رقم]"`;
    } else {
      info += `\n💡 استخدم "استكشف" للمتابعة`;
    }

    return { message: info };
  }
           }
