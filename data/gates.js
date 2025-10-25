// data/gates.js
export const gates = [
  {
    id: 'gate_ed',
    name: 'بوابات E-D',
    availableLocations: ['forest', 'snow', 'desert'],
    requiredLevel: 1,
    danger: 1,
    description: 'تستخدم للتدريب، لكنها لا تخلو من المفاجآت.',
    resources: ['broken_swords', 'low_currency'],
    monsters: ['low_level_goblin', 'giant_spiders', 'wild_boar'],
    drops: { low_currency: 10 }
  },
  {
    id: 'gate_ba',
    name: 'بوابات B-A',
    availableLocations: ['desert', 'ocean'],
    requiredLevel: 10,
    danger: 2,
    description: 'ساحة اختبار حقيقية للمغامرين الجدد.',
    resources: ['medium_ores', 'monster_hides'],
    monsters: ['goblin_warrior'],
    drops: { monster_hides: 3 }
  },
  {
    id: 'gate_as',
    name: 'بوابات A-S',
    availableLocations: ['underground_jungle', 'sky', 'old_temple'],
    requiredLevel: 20,
    danger: 3,
    description: 'تنتشر فيها الأشباح والغيلان الباحثة عن أرواح جديدة.',
    resources: ['rare_ores', 'trapped_souls'],
    monsters: ['ghoul'],
    drops: { trapped_souls: 2 }
  },
  {
    id: 'gate_s_rank',
    name: 'بوابات S-Rank',
    availableLocations: ['jungle_temple', 'hell', 'lunar_temple'],
    requiredLevel: 40,
    danger: 5,
    description: 'أعتى البوابات، لا ينجو منها إلا الصيادون الأسطوريون.',
    resources: ['dark_energy', 'dragon_blood', 'fire_crystals'],
    monsters: ['phantom_knight', 'fire_imp', 'cerberus', 'dragon_wyrm'],
    drops: { dragon_blood: 2, dark_energy: 3 }
  },
  {
    id: 'gate_double_dungeon',
    name: 'بوابات Double Dungeon',
    availableLocations: ['jungle_temple', 'hell'],
    requiredLevel: 45,
    danger: 5,
    description: 'بوابتان متداخلتان، حيث يختلط الواقع بالجحيم.',
    resources: ['rare_treasures', 'double_souls'],
    monsters: ['dragon_wyrm', 'cerberus'],
    drops: { rare_treasures: 1, double_souls: 2 }
  },
  {
    id: 'gate_ultimate_dungeon',
    name: 'بوابات Ultimate Dungeon',
    availableLocations: ['ruler_castle'],
    requiredLevel: 75,
    danger: 5,
    description: 'أقصى تجسيد للظلام، حيث يُختبر قدر الأبطال.',
    resources: ['chaos_essence', 'darkness_crystals'],
    monsters: ['abyssal_lord'],
    drops: { chaos_essence: 2, darkness_crystals: 3 }
  },
  {
    id: 'gate_ab_dark_soldier',
    name: 'بوابات A-B (جنود الظلام)',
    availableLocations: ['old_temple'],
    requiredLevel: 25,
    danger: 2,
    description: 'يسيطر عليها جنود الظلام الذين حاربوا قديمًا ضد البشر.',
    resources: ['training_tools', 'broken_armors'],
    monsters: ['dark_soldier'],
    drops: { broken_armors: 2 }
  },
  {
    id: 'gate_ca_ice',
    name: 'بوابات C-A (الثلج)',
    availableLocations: ['snow'],
    requiredLevel: 15,
    danger: 3,
    description: 'عالم جليدي تحكمه شياطين الثلج.',
    resources: ['ice_crystals', 'forgotten_equipment'],
    monsters: ['ice_demon'],
    drops: { ice_crystals: 3 }
  },
  {
    id: 'gate_s_rank_kamish',
    name: 'بوابات S-Rank (كاميش)',
    availableLocations: ['lunar_temple', 'ruler_castle'],
    requiredLevel: 80,
    danger: 5,
    description: 'مكان ظهور تنين Kamish، أقوى مخلوقات عالم البوابات.',
    resources: ['supreme_spirit_energy'],
    monsters: ['kamish'],
    drops: { supreme_spirit_energy: 1 }
  },
  {
    id: 'gate_s_rank_dark_lord',
    name: 'بوابات S-Rank (سيد الظلام)',
    availableLocations: ['dark_castle'],
    requiredLevel: 70,
    danger: 5,
    description: 'موطن سيد الظلام، النهاية الحتمية للمغامرين.',
    resources: ['shards_of_darkness'],
    monsters: ['dark_lord'],
    drops: { shards_of_darkness: 3 }
  },

  // Tiers Dynamic Dungeon
  {
    id: 'gate_td',
    name: 'بوابة T-D',
    availableLocations: ['village', 'forest', 'desert'],
    requiredLevel: 1,
    danger: 5,
    description: 'بوابة ديناميكية تتغير في كل دخول، تُعد اختبارًا شاملًا للقوة والتطور.',
    resources: ['random_tier_resources'],
    monsters: ['tier_1_3_monsters'],
    drops: { random_tier_resources: 2 }
  },

  // --- Solo Leveling inspired gates ---
  {
    id: 'solo_tier_1',
    name: 'بوابة سولُو - المستوى 1',
    availableLocations: ['forest', 'village'],
    requiredLevel: 1,
    danger: 1,
    description: 'بوابة بداية الصياد. مخلوقات ضعيفة ومهام تدريبية.',
    resources: ['weak_essence', 'low_tier_gems'],
    monsters: ['weak_slime', 'small_goblin', 'weak_wolf'],
    drops: { weak_essence: 5, low_tier_gems: 1, experience: 50 }
  },
  {
    id: 'solo_tier_2',
    name: 'بوابة سولُو - المستوى 2',
    availableLocations: ['desert', 'forest'],
    requiredLevel: 10,
    danger: 2,
    description: 'تحدٍ أعلى، وحوش أقوى، موارد أفضل.',
    resources: ['minor_essence', 'tier2_gems'],
    monsters: ['demon_eye_squad', 'armored_goblin', 'giant_spider'],
    drops: { minor_essence: 4, tier2_gems: 1, experience: 150 }
  },
  {
    id: 'solo_tier_3',
    name: 'بوابة سولُو - المستوى 3',
    availableLocations: ['underground_jungle', 'old_temple'],
    requiredLevel: 25,
    danger: 3,
    description: 'بوابة منظمة هرميًا مع مسارات متفرعة وزعماء فرعيين.',
    resources: ['essence_core', 'rare_gems'],
    monsters: ['shadow_wolf', 'sentry_golem', 'ghast'],
    drops: { essence_core: 2, rare_gems: 1, experience: 500 }
  },
  {
    id: 'solo_tier_boss',
    name: 'بوابة سولُو - رئيس التصنيف',
    availableLocations: ['jungle_temple', 'ruler_castle'],
    requiredLevel: 50,
    danger: 5,
    description: 'بوابة زعيم التصنيف - مكافآت ضخمة وخطر هائل.',
    resources: ['supreme_essence', 'unique_armor_part'],
    monsters: ['elite_guardian', 'tier_boss'],
    drops: { supreme_essence: 2, unique_armor_part: 1, experience: 2000 }
  }
];
