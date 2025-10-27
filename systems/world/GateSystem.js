// systems/world/GateSystem.js
import { gates } from '../../data/gates.js';
import { locations } from '../../data/locations.js';
import { items } from '../../data/items.js'; // افترضنا أنك دمجت itemsGates هنا

export class GateSystem {
  constructor({ battleSystem = null } = {}) {
    this.gates = gates;
    this.activeGateSessions = new Map(); // userId => session
    this.battleSystem = battleSystem;
    // خريطة زعماء محليين (يمكن تغيير/زيادة)
    this.gateBosses = this._createGateBosses();
    this.gateEvents = this._createGateEvents();
    console.log('🚪 GateSystem جاهز (قِصصي ومتوافق مع BattleSystem)');
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
          description: 'عثرت على صندوق كنز!' , 
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

  // معالجات الخيارات للبوابات المختلفة
  _handlePathChoice(player, session, choice) {
    let result = { message: '' };
    
    if (choice === 'انزل') {
      result.message = 'نزلت عبر الممر الضيق وعثرت على غرفة سرية تحت الأرض!\n';
      result.rewards = { iron_ore: 3, stone: 5 };
    } else if (choice === 'اعبر الجسر') {
      result.message = 'عبرت الجسر المضيء وشاهدت منظراً رائعاً من الأعلى!\n';
      result.rewards = { wood: 8, experience: 25 };
    }
    
    return result;
  }

  _handleSoloTier1Choice(player, session, choice) {
    let result = { message: '' };
    
    if (choice === 'اتجه نحو الأصوات') {
      result.message = 'اتجهت نحو الأصوات وواجهت مجموعة من الغوبلن!\n';
      result.combat = true;
      result.monsters = ['small_goblin', 'small_goblin'];
    } else if (choice === 'اتجه نحو الهدوء') {
      result.message = 'اتجهت نحو الهدوء وعثرت على مورد ثمين!\n';
      result.rewards = { weak_essence: 5, wood: 10 };
    }
    
    return result;
  }

  _handleSoloTier3Choice(player, session, choice) {
    let result = { message: '' };
    
    if (choice === 'تابع ببطء') {
      result.message = 'تقدّمت بحذر وتجنبت العديد من الأفخاخ!\n';
      result.rewards = { essence_core: 1, experience: 100 };
    } else if (choice === 'اندفع للأمام') {
      result.message = 'اندفعت للأمام بسرعة لكنك وقعت في فخ!\n';
      result.damage = 20;
      result.rewards = { essence_core: 2, experience: 150 }; // مكافأة أعلى مع خطر
    }
    
    return result;
  }

  _handleTDChoice(player, session, choice) {
    let result = { message: '' };
    
    if (choice === 'المسار الآمن') {
      result.message = 'اخترت المسار الآمن وحصلت على موارد تدريب!\n';
      result.rewards = { wood: 10, stone: 8, experience: 50 };
    } else if (choice === 'المسار الخطير') {
      result.message = 'اخترت المسار الخطير وواجهت تحديًا!\n';
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
    return this.gates.find(g => g.id.toLowerCase() === q || g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q));
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

  async enterGate(player, gateQuery) {
    if (this.battleSystem && this.battleSystem.activeBattles && this.battleSystem.activeBattles.has(player.userId)) {
      return { error: '⚔️ لا يمكنك دخول البوابة أثناء وجودك في قتال.' };
    }
    const gate = this.getGate(gateQuery);
    if (!gate) return { error: '❌ لم يتم العثور على هذه البوابة.' };
    if (!gate.availableLocations.includes(player.currentLocation)) {
      return { error: `❌ هذه البوابة غير موجودة في موقعك الحالي (${locations[player.currentLocation]?.name || player.currentLocation}).` };
    }
    if (player.level < (gate.requiredLevel || 0)) {
      return { error: `❌ تحتاج للمستوى ${gate.requiredLevel} لدخول ${gate.name}.` };
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
      currentEvent: null // 🆕 لتتبع الحدث الحالي مع الخيارات
    };
    this.activeGateSessions.set(player.userId, session);

    const ev = this._generateEvent(gate.id);
    session.events.push(ev);
    session.currentEvent = ev; // 🆕 تعيين الحدث الحالي

    let msg = `🌀 لقد دخلت ${gate.name}!\n\n${ev.description}\n\n`;
    
    // 🆕 عرض الخيارات إذا وجدت
    if (ev.choices && ev.choices.length > 0) {
      msg += `🛤️ **الخيارات المتاحة:**\n`;
      ev.choices.forEach((choice, index) => {
        msg += `${index + 1}. ${choice}\n`;
      });
      msg += `\n💡 **استخدم:** "اختر [رقم]" لاختيار مسار\n`;
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

    // 🆕 إذا كان هناك حدث حالي باختيارات، لا يمكن التقدم
    if (session.currentEvent && session.currentEvent.choices && session.currentEvent.choices.length > 0) {
      return { error: '❌ يجب اتخاذ قرار أولاً! استخدم "اختر [رقم]" لاختيار مسار.' };
    }

    session.steps++;

    const gateDef = this.gates.find(g => g.id === session.gateId);
    const boss = this.gateBosses[session.gateId] || null;

    // احتمال ظهور الزعيم بعد عددٍ من الخطوات
    const threshold = boss ? Math.max(2, Math.floor(Math.random() * 3) + 2) : 999;
    if (!session.bossDefeated && boss && session.steps >= threshold && Math.random() > 0.5) {
      session.awaitingBossCombat = true;
      // اطلب من BattleSystem بدء معركة مع الزعيم مع وسم gateId
      if (this.battleSystem && typeof this.battleSystem.startBattleWithMonster === 'function') {
        const bossCopy = Object.assign({}, boss);
        // وسم الزعيم بأنه مرتبط بهذه البوابة
        bossCopy.meta = { gateId: session.gateId, isGateBoss: true };
        // إبدأ المعركة؛ BattleSystem سيحفظ في activeBattles
        const startRes = await this.battleSystem.startBattleWithMonster(player, bossCopy, { isGateBoss: true, gateId: session.gateId });
        return { message: `🐉 الزعيم يظهر: ${boss.name}!\n${startRes.message || ''}` };
      } else {
        return { message: `🐉 ${boss.name} يظهر أمامك! لكن نظام المعارك لا يدعم بدء معركة مخصصة.` };
      }
    }

    // حدث عادي
    const ev = this._generateEvent(session.gateId);
    session.events.push(ev);
    session.currentEvent = ev; // 🆕 تحديث الحدث الحالي

    let msg = `📍 خطوة ${session.steps}: ${ev.description}\n\n`;
    
    // تطبيق النتائج الفورية للحدث
    if (ev.rewards) {
      for (const [itemId, qty] of Object.entries(ev.rewards)) {
        if (typeof player.addItem === 'function') player.addItem(itemId, items[itemId]?.name || itemId, 'resource', qty);
        else {
          // بديل إذا لم تكن الدالة متوفرة
          const currentQty = player.getItemQuantity ? player.getItemQuantity(itemId) : 0;
          player.inventory = player.inventory || {};
          player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
        }
        msg += `🎁 +${qty} × ${items[itemId]?.name || itemId}\n`;
      }
    }
    if (ev.damage) {
      if (typeof player.takeDamage === 'function') player.takeDamage(ev.damage);
      else player.health = Math.max(0, (player.health || 0) - ev.damage);
      msg += `💔 خسرت ${ev.damage} صحة.\n`;
    }
    if (ev.heal) {
      if (typeof player.heal === 'function') player.heal(ev.heal);
      else player.health = Math.min(player.maxHealth || 100, (player.health || 0) + ev.heal);
      msg += `💚 استعدت ${ev.heal} صحة.\n`;
    }

    // 🆕 عرض الخيارات إذا وجدت
    if (ev.choices && ev.choices.length > 0) {
      msg += `\n🛤️ **الخيارات المتاحة:**\n`;
      ev.choices.forEach((choice, index) => {
        msg += `${index + 1}. ${choice}\n`;
      });
      msg += `\n💡 **استخدم:** "اختر [رقم]" لاختيار مسار\n`;
    } else {
      msg += `\n📊 حالتك: ${player.health || '?'} / ${player.maxHealth || '?'} HP`;
      msg += `\n💡 استخدم "استكشف" للاستمرار.`;
    }
    
    return { message: msg };
  }

  // 🆕 دالة جديدة لمعالجة الاختيارات
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
    
    // تطبيق المكافآت إذا وجدت
    if (result.rewards) {
      for (const [itemId, qty] of Object.entries(result.rewards)) {
        if (typeof player.addItem === 'function') {
          player.addItem(itemId, items[itemId]?.name || itemId, 'resource', qty);
        } else {
          player.inventory = player.inventory || {};
          player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
        }
        result.message += `\n🎁 +${qty} × ${items[itemId]?.name || itemId}`;
      }
    }
    
    // تطبيق الضرر إذا وجد
    if (result.damage) {
      if (typeof player.takeDamage === 'function') {
        player.takeDamage(result.damage);
      } else {
        player.health = Math.max(0, (player.health || 0) - result.damage);
      }
      result.message += `\n💔 خسرت ${result.damage} صحة.`;
    }
    
    // معالجة القتال إذا طلب
    if (result.combat && this.battleSystem && typeof this.battleSystem.startBattleWithMonsters === 'function') {
      const combatResult = await this.battleSystem.startBattleWithMonsters(player, result.monsters);
      result.message += `\n\n${combatResult.message || '⚔️ بدأت المعركة!'}`;
    }
    
    // مسح الحدث الحالي للسماح بالاستكشاف التالي
    session.currentEvent = null;
    
    result.message += `\n\n📊 حالتك: ${player.health || '?'} / ${player.maxHealth || '?'} HP`;
    result.message += `\n💡 استخدم "استكشف" للمتابعة.`;
    
    return result;
  }

  // دُعي عندما يهزم BattleSystem وحش مرتبط ببوابة
  async onBossDefeated(player, gateId, battleResult = {}) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session || session.gateId !== gateId) {
      // حاول العثور على جلسة مطابقة
      for (const s of this.activeGateSessions.values()) {
        if (s.playerId === player.userId && s.gateId === gateId) {
          // نستخدم هذه الجلسة
          s.bossDefeated = true;
          s.closed = true;
          break;
        }
      }
      return { error: 'جلسة البوابة غير موجودة.' };
    }

    session.bossDefeated = true;
    session.closed = true;
    session.currentEvent = null; // 🆕 مسح أي حدث حالي

    const gate = this.gates.find(g => g.id === gateId);
    const drops = gate?.drops || {};
    let msg = `🏆 هزمت زعيم ${this.gateBosses[gateId]?.name || gate?.name || gateId}!\n\n`;

    // منح الدروب
    if (drops && Object.keys(drops).length) {
      for (const [itemId, qty] of Object.entries(drops)) {
        if (typeof player.addItem === 'function') {
          player.addItem(itemId, items[itemId]?.name || itemId, 'boss_drop', qty);
        } else {
          player.inventory = player.inventory || {};
          player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
        }
        msg += `🎁 +${qty} × ${items[itemId]?.name || itemId}\n`;
      }
    }

    // منح مكافآت الزعيم
    const bossRewards = this.gateBosses[gateId]?.rewards;
    if (bossRewards) {
      for (const [itemId, qty] of Object.entries(bossRewards)) {
        if (itemId !== 'experience') { // الخبرة نتعامل معها بشكل منفصل
          if (typeof player.addItem === 'function') {
            player.addItem(itemId, items[itemId]?.name || itemId, 'boss_reward', qty);
          } else {
            player.inventory = player.inventory || {};
            player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
          }
          msg += `🏆 +${qty} × ${items[itemId]?.name || itemId}\n`;
        }
      }
    }

    // منح خبرة إن وُجدت
    const exp = battleResult.experience || (drops.experience || 0) || (this.gateBosses[gateId]?.rewards?.experience || 0);
    if (exp && typeof player.addExperience === 'function') player.addExperience(exp);
    if (exp) msg += `✨ +${exp} خبرة\n`;

    // أغلق الجلسة نهائيًا
    this.activeGateSessions.delete(player.userId);
    
    msg += `\n🎉 أكملت البوابة بنجاح! إجمالي الخطوات: ${session.steps}`;
    
    return { message: msg };
  }

  async leaveGate(player, force = false) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) return { error: '❌ لست داخل بوابة.' };

    if (session.awaitingBossCombat && !force) {
      return { error: '⚔️ لا يمكنك المغادرة الآن — الزعيم ظهر، ابدأ القتال أو استخدم هروب.' };
    }
    if (force && typeof player.useStamina === 'function') {
      // عقوبة مغادرة قسرية
      const penalty = Math.min(player.getActualStamina ? player.getActualStamina() : (player.activityPoints || player.stamina || 0), 10 + (session.steps || 0));
      player.useStamina(penalty);
    }
    
    const steps = session.steps;
    this.activeGateSessions.delete(player.userId);
    
    return { message: `🚪 غادرت البوابة (${session.gateId}). إجمالي الخطوات: ${steps}` };
  }

  // 🆕 دالة مساعدة للحصول على معلومات الجلسة الحالية
  getSessionInfo(player) {
    const session = this.activeGateSessions.get(player.userId);
    if (!session) return { error: '❌ لست داخل بوابة.' };

    const gate = this.gates.find(g => g.id === session.gateId);
    let info = `🚪 **معلومات البوابة الحالية:**\n`;
    info += `• البوابة: ${gate?.name || session.gateId}\n`;
    info += `• الخطوات: ${session.steps}\n`;
    info += `• الحالة: ${session.closed ? 'مغلقة' : session.awaitingBossCombat ? 'في مواجهة زعيم' : 'نشطة'}\n`;
    
    if (session.currentEvent && session.currentEvent.choices && session.currentEvent.choices.length > 0) {
      info += `\n🛤️ **خيارات متاحة:**\n`;
      session.currentEvent.choices.forEach((choice, index) => {
        info += `${index + 1}. ${choice}\n`;
      });
      info += `\n💡 استخدم "اختر [رقم]" لاتخاذ القرار`;
    } else {
      info += `\n💡 استخدم "استكشف" للمتابعة`;
    }

    return { message: info };
  }
          }
