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
        { type: 'narrative', description: 'عبرت ممرًا مظلماً ووجدت طريقين: واحد ضيق وآخر على جسر مضيء.', choices: ['انزل', 'اعبر الجسر'] },
        { type: 'treasure', description: 'عثرت على صندوق كنز!' , rewards: { wood: 5, stone: 3 } },
        { type: 'trap', description: '⚠️ لقد وقعت في فخ! خسرت بعض الصحة.', damage: 10 }
      ],
      solo_tier_1: [
        { type: 'narrative', description: 'داخل البوابة طرق متفرعة — مسار هادئ وآخر تردد عليه أصوات.', choices: ['اتجه نحو الأصوات', 'اتجه نحو الهدوء'] },
        { type: 'combat', description: 'مجموعة من الكائنات الضعيفة تهاجم!', monsters: ['weak_slime'] },
        { type: 'resource', description: 'بقعة جوهر! تحصل على جوهر ضعيف.', rewards: { weak_essence: 3 } }
      ],
      solo_tier_3: [
        { type: 'narrative', description: 'الخطوات تتعرّض لهزات أرضية — يبدو أن قلب البوابة قريب.', choices: ['تابع ببطء', 'اندفع للأمام'] },
        { type: 'trap', description: 'فخ أرضي قوي! خسرت جزءًا كبيرًا من الصحة.', damage: 30 }
      ]
    };
  }

  _createGateBosses() {
    return {
      gate_ed: { id: 'gate_guardian', name: 'حارس البوابة', level: 5, health: 120, maxHealth: 120, damage: 15, defense: 8, rewards: { wood: 10, stone: 8, experience: 100 } },
      gate_ba: { id: 'shadow_warrior', name: 'محارب الظل', level: 12, health: 200, maxHealth: 200, damage: 25, defense: 15, rewards: { iron_ore: 8, experience: 200 } },
      solo_tier_boss: { id: 'solo_tier_boss_entity', name: 'زعيم بوابة سولُو', level: 55, health: 1200, maxHealth: 1200, damage: 80, defense: 40, rewards: { supreme_essence: 2, unique_armor_part: 1, experience: 2000 } }
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
      closed: false
    };
    this.activeGateSessions.set(player.userId, session);

    const ev = this._generateEvent(gate.id);
    session.events.push(ev);

    let msg = `🌀 لقد دخلت ${gate.name}!\n\n${ev.description}\n\n`;
    if (ev.choices) msg += `خيارات: ${ev.choices.join(' / ')}\n\n`;
    msg += 'استخدم `exploreGate(player)` للاستمرار.';
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

    let msg = `📍 خطوة ${session.steps}: ${ev.description}\n\n`;
    if (ev.rewards) {
      for (const [itemId, qty] of Object.entries(ev.rewards)) {
        if (typeof player.addItem === 'function') player.addItem(itemId, items[itemId]?.name || itemId, 'resource', qty);
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

    msg += `\n📊 حالتك: ${player.health || '?'} / ${player.maxHealth || '?'} HP`;
    return { message: msg };
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
        }
      }
    }
    if (!session) return { error: 'جلسة البوابة غير موجودة.' };

    session.bossDefeated = true;
    session.closed = true;

    const gate = this.gates.find(g => g.id === gateId);
    const drops = gate?.drops || {};
    let msg = `🏆 هزمت زعيم ${this.gateBosses[gateId]?.name || gate?.name || gateId}!\n\n`;

    // منح الدروب
    if (drops && Object.keys(drops).length) {
      for (const [itemId, qty] of Object.entries(drops)) {
        if (typeof player.addItem === 'function') player.addItem(itemId, items[itemId]?.name || itemId, 'boss_drop', qty);
        msg += `🎁 +${qty} × ${items[itemId]?.name || itemId}\n`;
      }
    }

    // منح خبرة إن وُجدت
    const exp = battleResult.experience || (drops.experience || 0) || (this.gateBosses[gateId]?.rewards?.experience || 0);
    if (exp && typeof player.addExperience === 'function') player.addExperience(exp);
    if (exp) msg += `✨ +${exp} خبرة\n`;

    // أغلق الجلسة نهائيًا
    this.activeGateSessions.delete(player.userId);
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
    this.activeGateSessions.delete(player.userId);
    return { message: `🚪 غادرت البوابة (${session.gateId}).` };
  }
}
