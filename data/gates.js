export const gates = [
  // البوابات الجديدة
  {
    id: 'gate_ed',
    name: 'بوابات E-D',
    availableLocations: ['forest', 'snow', 'desert'],
    requiredLevel: 1,
    danger: 1,
    description: 'تستخدم للتدريب، لكنها لا تخلو من المفاجآت.',
    resources: ['broken_swords', 'low_currency'],
    monsters: ['low_level_goblin', 'giant_spiders', 'wild_boar']
  },
  {
    id: 'gate_ba',
    name: 'بوابات B-A',
    availableLocations: ['desert', 'ocean'],
    requiredLevel: 10,
    danger: 2,
    description: 'ساحة اختبار حقيقية للمغامرين الجدد.',
    resources: ['medium_ores', 'monster_hides'],
    monsters: ['goblin_warrior']
  },
  {
    id: 'gate_as',
    name: 'بوابات A-S',
    availableLocations: ['underground_jungle', 'sky', 'old_temple'],
    requiredLevel: 20,
    danger: 3,
    description: 'تنتشر فيها الأشباح والغيلان الباحثة عن أرواح جديدة.',
    resources: ['rare_ores', 'trapped_souls'],
    monsters: ['ghoul']
  },
  {
    id: 'gate_s_rank',
    name: 'بوابات S-Rank',
    availableLocations: ['jungle_temple', 'hell', 'lunar_temple'],
    requiredLevel: 40,
    danger: 5,
    description: 'أعتى البوابات، لا ينجو منها إلا الصيادون الأسطوريون.',
    resources: ['dark_energy', 'dragon_blood', 'fire_crystals'],
    monsters: ['phantom_knight', 'fire_imp', 'cerberus', 'dragon_wyrm']
  },
  {
    id: 'gate_double_dungeon',
    name: 'بوابات Double Dungeon',
    availableLocations: ['jungle_temple', 'hell'],
    requiredLevel: 45,
    danger: 5,
    description: 'بوابتان متداخلتان، حيث يختلط الواقع بالجحيم.',
    resources: ['rare_treasures', 'double_souls'],
    monsters: ['dragon_wyrm', 'cerberus']
  },
  {
    id: 'gate_ultimate_dungeon',
    name: 'بوابات Ultimate Dungeon',
    availableLocations: ['ruler_castle'],
    requiredLevel: 75,
    danger: 5,
    description: 'أقصى تجسيد للظلام، حيث يُختبر قدر الأبطال.',
    resources: ['chaos_essence', 'darkness_crystals'],
    monsters: ['abyssal_lord']
  },
  {
    id: 'gate_ab_dark_soldier',
    name: 'بوابات A-B (جنود الظلام)',
    availableLocations: ['old_temple'],
    requiredLevel: 25,
    danger: 2,
    description: 'يسيطر عليها جنود الظلام الذين حاربوا قديمًا ضد البشر.',
    resources: ['training_tools', 'broken_armors'],
    monsters: ['dark_soldier']
  },
  {
    id: 'gate_ca_ice',
    name: 'بوابات C-A (الثلج)',
    availableLocations: ['snow'],
    requiredLevel: 15,
    danger: 3,
    description: 'عالم جليدي تحكمه شياطين الثلج.',
    resources: ['ice_crystals', 'forgotten_equipment'],
    monsters: ['ice_demon']
  },
  {
    id: 'gate_s_rank_kamish',
    name: 'بوابات S-Rank (كاميش)',
    availableLocations: ['lunar_temple', 'ruler_castle'],
    requiredLevel: 80,
    danger: 5,
    description: 'مكان ظهور تنين Kamish، أقوى مخلوقات عالم البوابات.',
    resources: ['supreme_spirit_energy'],
    monsters: ['kamish']
  },
  {
    id: 'gate_s_rank_dark_lord',
    name: 'بوابات S-Rank (سيد الظلام)',
    availableLocations: ['dark_castle'],
    requiredLevel: 70,
    danger: 5,
    description: 'موطن سيد الظلام، النهاية الحتمية للمغامرين.',
    resources: ['shards_of_darkness'],
    monsters: ['dark_lord']
  },
  {
    id: 'gate_td',
    name: 'بوابة T-D',
    availableLocations: ['village', 'forest', 'desert'],
    requiredLevel: 1,
    danger: 5,
    description: 'بوابة ديناميكية تتغير في كل دخول، تُعد اختبارًا شاملًا للقوة والتطور.',
    resources: ['random_tier_resources'],
    monsters: ['tier_1_3_monsters']
  }
];
