export const accessories = {
  // accessories grant special bonuses (format: effects object)
  // effects may be: { attackFlat, attackPct, defenseFlat, defensePct, critChance, speedPct, lifeStealPct, regen }
  rusty_ring: {
    id: 'rusty_ring',
    name: 'خاتم صدئ',
    type: 'accessory',
    description: 'خاتم قديم يعطي دفعة بسيطة للهجوم.',
    rarity: 'common',
    level: 2,
    effects: { attackFlat: 3 }
  },

  hunter_amulet: {
    id: 'hunter_amulet',
    name: 'قلادة الصياد',
    type: 'accessory',
    description: 'يزيد من فرصة الضربة الحرجة قليلاً.',
    rarity: 'uncommon',
    level: 10,
    effects: { critChance: 4, attackPct: 0.02 }
  },

  winged_boots: {
    id: 'winged_boots',
    name: 'أحذية مجنحة',
    type: 'accessory',
    description: 'تسمح بالقفز مرتين وتزيد السرعة.',
    rarity: 'rare',
    level: 28,
    effects: { speedPct: 0.12 }
  },

  life_amulet: {
    id: 'life_amulet',
    name: 'قلادة الحياة',
    type: 'accessory',
    description: 'تسرق جزءًا بسيطًا من الحياة مع كل ضربة.',
    rarity: 'epic',
    level: 50,
    effects: { lifeStealPct: 0.06, regen: 0.5 }
  },

  phoenix_emblem: {
    id: 'phoenix_emblem',
    name: 'شارة الفينيق',
    type: 'accessory',
    description: 'يعيد تلقائياً جزءًا من الصحة بعد الموت مرة واحدة (ناقش تطبيقه في اللوغيك).',
    rarity: 'legendary',
    level: 90,
    effects: { reviveOnce: true, regen: 2 }
  },

  cosmic_core: {
    id: 'cosmic_core',
    name: 'نواة كونية',
    type: 'accessory',
    description: 'يزيد جميع الهجمات بنسبة كبيرة ويمنح فرصة نقدية عالية.',
    rarity: 'mythical',
    level: 100,
    effects: { attackPct: 0.25, critChance: 15 }
  },

  wyvern_wings: {
    id: 'wyvern_wings',
    name: 'أجنحة الوايفرن',
    type: 'accessory',
    description: 'إكسسوار طيران: يسمح بالطيران والتحليق لفترة قصيرة.',
    rarity: 'rare',
    level: 45,
    effects: { speedPct: 0.15 }
  },

  solar_band: {
    id: 'solar_band',
    name: 'سوار الشمس',
    type: 'accessory',
    description: 'يزيد ضرر النيران والشمس.',
    rarity: 'legendary',
    level: 92,
    effects: { attackPct: 0.12, elementBonus: { fire: 0.15, solar: 0.2 } }
  },

  quickening_charm: {
    id: 'quickening_charm',
    name: 'تميمة السرعة',
    type: 'accessory',
    description: 'تزيد سرعة الهجوم بنسبة كبيرة.',
    rarity: 'epic',
    level: 60,
    effects: { attackSpeedPct: 0.25, speedPct: 0.1 }
  }
};
