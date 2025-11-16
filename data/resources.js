
// 📦 /data/resources.js
// قاعدة بيانات الموارد المستوحاة من Terraria وSolo Leveling
// تشمل الموارد، الخامات، السبائك، الشظايا، الأرواح، والمعادن النادرة

export const resources = {
  // 🌿 الموارد السهلة - UPDATED
  slime_gel: {
    id: 'slime_gel',
    name: 'جل الوحل',
    description: 'مادة لزجة يسقطها وحش الوحل، تُستخدم في صناعة الجرع والأدوات السحرية.',
    rarity: 'common',
    difficultyLevel: 1,
    locations: ['forest', 'desert', 'plains'],
    gatherTime: 3000,
    experience: 5,
    items: [{ itemId: 'slime_gel', min: 1, max: 3, chance: 1 }]
  },
  wood: {
    id: 'wood',
    name: 'خشب',
    description: 'مورد أساسي يُستخدم في بناء الأسلحة والهياكل.',
    rarity: 'common',
    difficultyLevel: 1,
    locations: ['forest', 'plains'],
    gatherTime: 4000,
    experience: 5,
    items: [{ itemId: 'wood', min: 1, max: 3, chance: 1 }]
  },
  stone: {
    id: 'stone',
    name: 'حجر',
    description: 'مادة صلبة تُستخدم في البناء وصناعة الأدوات.',
    rarity: 'common',
    difficultyLevel: 1,
    locations: ['forest', 'mountain', 'plains'],
    gatherTime: 5000,
    experience: 6,
    items: [{ itemId: 'stone', min: 1, max: 3, chance: 1 }]
  },

  // عناصر الفرن الجديدة - UPDATED
  furnace: {
    id: "furnace",
    name: "فرن",
    type: "tool",
    description: "يستخدم لطهو الطعام وصهر الخامات",
    craftable: true,
    recipe: {
      "stone": 8,
      "clay": 4
    },
    stats: {}
  },

  clay: {
    id: "clay",
    name: "طين",
    type: "material", 
    description: "مادة لصناعة الفخار والفرن",
    rarity: "common",
    difficultyLevel: 1,
    locations: ["forest", "river"],
    gatherTime: 6000,
    experience: 7,
    items: [{ itemId: "clay", min: 1, max: 3, chance: 1 }]
  },

  coal: {
    id: "coal",
    name: "فحم", 
    type: "material",
    description: "وقود للفرن",
    rarity: "common",
    difficultyLevel: 2,
    locations: ["cave", "mountain"],
    gatherTime: 7000, 
    experience: 9,
    items: [{ itemId: "coal", min: 1, max: 2, chance: 1 }]
  },

  // أطعمة وخامات إضافية - UPDATED
  raw_meat: {
    id: "raw_meat",
    name: "لحم نيء",
    type: "material",
    description: "لحم يحتاج للطهو",
    rarity: "common", 
    difficultyLevel: 1,
    locations: ["forest"],
    gatherTime: 5000,
    experience: 6,
    items: [{ itemId: "raw_meat", min: 1, max: 2, chance: 1 }]
  },

  raw_fish: {
    id: "raw_fish", 
    name: "سمك نيء",
    type: "material",
    description: "سمك يحتاج للطهو",
    rarity: "common",
    difficultyLevel: 1, 
    locations: ["ocean", "river"],
    gatherTime: 6000,
    experience: 7,
    items: [{ itemId: "raw_fish", min: 1, max: 2, chance: 1 }]
  },

  wheat: {
    id: "wheat",
    name: "قمح",
    type: "material",
    description: "حبوب لصناعة الخبز", 
    rarity: "common",
    difficultyLevel: 1,
    locations: ["plains", "forest"],
    gatherTime: 5000,
    experience: 6,
    items: [{ itemId: "wheat", min: 1, max: 3, chance: 1 }]
  },

  // ⚒️ الخامات والسبائك - UPDATED
  copper_ore: {
    id: 'copper_ore',
    name: 'خام النحاس',
    description: 'خام معدني شائع يُستخدم لصناعة الأدوات والأسلحة البسيطة.',
    rarity: 'common',
    difficultyLevel: 1,
    locations: ['forest', 'mountain', 'cave'],
    gatherTime: 7000,
    experience: 8,
    items: [{ itemId: 'copper_ore', min: 1, max: 3, chance: 1 }]
  },
  copper_bar: {
    id: 'copper_bar',
    name: 'سبيكة نحاسية',
    description: 'نتيجة صهر خام النحاس، تُستخدم في صناعة الأسلحة المعدنية.',
    rarity: 'uncommon',
    difficultyLevel: 2,
    locations: ['forge'],
    gatherTime: 8000,
    experience: 10,
    items: [{ itemId: 'copper_bar', min: 1, max: 2, chance: 1 }]
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'خام الحديد',
    description: 'خام قوي يُستخدم لصناعة الدروع والأسلحة المتوسطة.',
    rarity: 'common',
    difficultyLevel: 1,
    locations: ['cave', 'mountain'],
    gatherTime: 8000,
    experience: 10,
    items: [{ itemId: 'iron_ore', min: 1, max: 2, chance: 1 }]
  },
  iron_bar: {
    id: 'iron_bar',
    name: 'سبيكة حديدية',
    description: 'نتيجة صهر خام الحديد، تُستخدم لصناعة المعدات المتوسطة.',
    rarity: 'uncommon',
    difficultyLevel: 2,
    locations: ['forge'],
    gatherTime: 9000,
    experience: 12,
    items: [{ itemId: 'iron_bar', min: 1, max: 2, chance: 1 }]
  },
  silver_ore: {
    id: 'silver_ore',
    name: 'خام الفضة',
    description: 'معدن لامع يُستخدم في صناعة الأدوات المتقدمة والمجوهرات.',
    rarity: 'uncommon',
    difficultyLevel: 2,
    locations: ['snow', 'mountain'],
    gatherTime: 9000,
    experience: 12,
    items: [{ itemId: 'silver_ore', min: 1, max: 2, chance: 1 }]
  },
  silver_bar: {
    id: 'silver_bar',
    name: 'سبيكة فضية',
    description: 'ناتجة عن صهر خام الفضة، تُستخدم في الأدوات النادرة.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['forge'],
    gatherTime: 10000,
    experience: 14,
    items: [{ itemId: 'silver_bar', min: 1, max: 1, chance: 1 }]
  },
  gold_ore: {
    id: 'gold_ore',
    name: 'خام الذهب',
    description: 'معدن ثمين يُستخدم في صناعة الأسلحة والدروع الفاخرة.',
    rarity: 'uncommon',
    difficultyLevel: 2,
    locations: ['desert', 'underground_jungle'],
    gatherTime: 10000,
    experience: 15,
    items: [{ itemId: 'gold_ore', min: 1, max: 1, chance: 1 }]
  },
  gold_bar: {
    id: 'gold_bar',
    name: 'سبيكة ذهبية',
    description: 'نتيجة صهر خام الذهب، مادة فاخرة لصناعة المعدات المميزة.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['forge'],
    gatherTime: 11000,
    experience: 16,
    items: [{ itemId: 'gold_bar', min: 1, max: 1, chance: 1 }]
  },
  platinum_ore: {
    id: 'platinum_ore',
    name: 'خام البلاتين',
    description: 'أحد أندر الخامات المعدنية، يتميز بالقوة والمتانة.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['desert', 'sky'],
    gatherTime: 12000,
    experience: 18,
    items: [{ itemId: 'platinum_ore', min: 1, max: 1, chance: 1 }]
  },
  platinum_bar: {
    id: 'platinum_bar',
    name: 'سبيكة بلاتين',
    description: 'سبيكة قوية تستخدم في صناعة الأسلحة عالية المستوى.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['forge'],
    gatherTime: 13000,
    experience: 20,
    items: [{ itemId: 'platinum_bar', min: 1, max: 1, chance: 1 }]
  },
  hellstone: {
    id: 'hellstone',
    name: 'حجر الجحيم',
    description: 'حجر ناري مستخرج من أعماق الجحيم، يستخدم لصناعة المعدات النارية.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['hell'],
    gatherTime: 14000,
    experience: 25,
    items: [{ itemId: 'hellstone', min: 1, max: 1, chance: 1 }]
  },
  hellstone_bar: {
    id: 'hellstone_bar',
    name: 'سبيكة الجحيم',
    description: 'ناتجة عن صهر حجر الجحيم، وتُستخدم لصناعة أسلحة نارية قوية.',
    rarity: 'epic',
    difficultyLevel: 4,
    locations: ['forge', 'hell'],
    gatherTime: 15000,
    experience: 30,
    items: [{ itemId: 'hellstone_bar', min: 1, max: 1, chance: 1 }]
  },

  // 🌺 موارد الغابة والسماء - UPDATED
  vine: {
    id: 'vine',
    name: 'الكرمة',
    description: 'نبتة متسلقة تُستخدم في صناعة الحبال والدروع الطبيعية.',
    rarity: 'common',
    difficultyLevel: 2,
    locations: ['forest', 'underground_jungle'],
    gatherTime: 6000,
    experience: 7,
    items: [{ itemId: 'vine', min: 1, max: 3, chance: 1 }]
  },
  honey: {
    id: 'honey',
    name: 'عسل النحل',
    description: 'مورد طبيعي يُستخدم في الجرع والشفاء.',
    rarity: 'uncommon',
    difficultyLevel: 2,
    locations: ['forest', 'jungle'],
    gatherTime: 8000,
    experience: 10,
    items: [{ itemId: 'honey', min: 1, max: 1, chance: 1 }]
  },
  wyvern_wings: {
    id: 'wyvern_wings',
    name: 'أجنحة الوايفرن',
    description: 'أجنحة سحرية تمنح القدرة على الطيران، تُسقط من تنين السماء.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['sky'],
    gatherTime: 12000,
    experience: 18,
    items: [{ itemId: 'wyvern_wings', min: 1, max: 1, chance: 0.5 }]
  },

  // ⚡ موارد الأرواح - UPDATED
  soul_of_light: {
    id: 'soul_of_light',
    name: 'روح الضوء',
    description: 'قوة روحية تُسقط من The Twins، تستخدم في السحر والأسلبة.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['hardmode_areas'],
    gatherTime: 12000,
    experience: 18,
    items: [{ itemId: 'soul_of_light', min: 1, max: 1, chance: 0.7 }]
  },
  soul_of_night: {
    id: 'soul_of_night',
    name: 'روح الليل',
    description: 'قوة روحية مظلمة، تُسقط من Dark Knight بعد دخول Hardmode.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['caves_hardmode'],
    gatherTime: 13000,
    experience: 20,
    items: [{ itemId: 'soul_of_night', min: 1, max: 1, chance: 0.7 }]
  },
  soul_of_might: {
    id: 'soul_of_might',
    name: 'روح القوة',
    description: 'قوة تُسقط من The Twins، تستخدم لتطوير الأسلحة القوية.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['hardmode_areas'],
    gatherTime: 14000,
    experience: 22,
    items: [{ itemId: 'soul_of_might', min: 1, max: 1, chance: 0.6 }]
  },
  soul_of_fright: {
    id: 'soul_of_fright',
    name: 'روح الرعب',
    description: 'قوة مظلمة تستخدم في الأسلحة السحرية، تُسقط من Skeletron Prime.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['hardmode_bosses'],
    gatherTime: 14000,
    experience: 22,
    items: [{ itemId: 'soul_of_fright', min: 1, max: 1, chance: 0.6 }]
  },
  soul_of_sight: {
    id: 'soul_of_sight',
    name: 'روح البصر',
    description: 'قوة روحية تستخدم في صناعة المعدات، تُسقط من The Twins.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['hardmode_areas'],
    gatherTime: 14000,
    experience: 22,
    items: [{ itemId: 'soul_of_sight', min: 1, max: 1, chance: 0.6 }]
  },

  // 💎 الموارد الأسطورية والفائقة - UPDATED
  divine_fragment: {
    id: 'divine_fragment',
    name: 'الشظايا العظيمة',
    description: 'شظايا متوهجة ناتجة من معارك الألهة، تُستخدم لصناعة المعدات المقدسة.',
    rarity: 'legendary',
    difficultyLevel: 5,
    locations: ['divine_dungeon'],
    gatherTime: 25000,
    experience: 40,
    items: [{ itemId: 'divine_fragment', min: 1, max: 1, chance: 0.6 }]
  },
  divine_steel: {
    id: 'divine_steel',
    name: 'الصلب العظيم',
    description: 'معدن أسطوري ناتج من دمج الشظايا العظيمة.',
    rarity: 'legendary',
    difficultyLevel: 5,
    locations: ['divine_dungeon'],
    gatherTime: 28000,
    experience: 50,
    items: [{ itemId: 'divine_steel', min: 1, max: 1, chance: 0.5 }]
  },
  soul_shard: {
    id: 'soul_shard',
    name: 'شظايا الروح',
    description: 'بقايا طاقة الأرواح القوية، تُستخدم في تطوير الأسلحة السحرية.',
    rarity: 'legendary',
    difficultyLevel: 5,
    locations: ['final_stage'],
    gatherTime: 30000,
    experience: 55,
    items: [{ itemId: 'soul_shard', min: 1, max: 1, chance: 0.4 }]
  },
  celestial_fragment: {
    id: 'celestial_fragment',
    name: 'شظايا سماوية',
    description: 'مادة نادرة تُسقط من تنين السماء السماوي.',
    rarity: 'mythic',
    difficultyLevel: 5,
    locations: ['final_stage', 'celestial_gate'],
    gatherTime: 35000,
    experience: 60,
    items: [{ itemId: 'celestial_fragment', min: 1, max: 1, chance: 0.4 }]
  },
  dark_crystal: {
    id: 'dark_crystal',
    name: 'البلورة المظلمة',
    description: 'بلورة غامضة تحتوي على طاقة الهاوية المظلمة.',
    rarity: 'mythic',
    difficultyLevel: 5,
    locations: ['abyss_gate'],
    gatherTime: 40000,
    experience: 65,
    items: [{ itemId: 'dark_crystal', min: 1, max: 1, chance: 0.3 }]
  },

  // ===================================
  // موارد جديدة - NEW ADDITIONS
  // ===================================
  
  // موارد إضافية من القائمة
  demonite_ore: {
    id: 'demonite_ore',
    name: 'خام الشيطان',
    description: 'خام مظلم يسقط بعد هزيمة Eye of Cthulhu.',
    rarity: 'uncommon',
    difficultyLevel: 2,
    locations: ['forest', 'cave'],
    gatherTime: 9000,
    experience: 12,
    items: [{ itemId: 'demonite_ore', min: 1, max: 2, chance: 1 }]
  },

  moon_dust: {
    id: 'moon_dust',
    name: 'غبار القمر',
    description: 'غبار سحري يسقط من Moon Lord.',
    rarity: 'epic',
    difficultyLevel: 4,
    locations: ['lunar_temple'],
    gatherTime: 20000,
    experience: 35,
    items: [{ itemId: 'moon_dust', min: 3, max: 8, chance: 1 }]
  },

  lihzahrd_power_cell: {
    id: 'lihzahrd_power_cell',
    name: 'خلية قوة ليهزار',
    description: 'خلية طاقة قديمة من معبد الغابة.',
    rarity: 'rare',
    difficultyLevel: 3,
    locations: ['jungle_temple'],
    gatherTime: 15000,
    experience: 25,
    items: [{ itemId: 'lihzahrd_power_cell', min: 1, max: 1, chance: 1 }]
  },

  plantera_bulb: {
    id: 'plantera_bulb',
    name: 'زهرة بلانتيرا',
    description: 'زهرة سحرية تنمو في الغابة الجوفية.',
    rarity: 'epic',
    difficultyLevel: 4,
    locations: ['underground_jungle'],
    gatherTime: 18000,
    experience: 30,
    items: [{ itemId: 'plantera_bulb', min: 1, max: 1, chance: 1 }]
  },

  solar_fragment: {
    id: 'solar_fragment',
    name: 'شظايا شمسية',
    description: 'شظايا مشعة من حدث الكسوف الشمسي.',
    rarity: 'epic',
    difficultyLevel: 4,
    locations: ['solar_eclipse'],
    gatherTime: 16000,
    experience: 28,
    items: [{ itemId: 'solar_fragment', min: 2, max: 6, chance: 0.4 }]
  },

  // موارد البوابات المتقدمة
  abyssal_blade_resource: {
    id: 'abyssal_blade_resource',
    name: 'شفرة الهاوية',
    description: 'شفرة مصنوعة من قلب الهاوية.',
    rarity: 'mythic',
    difficultyLevel: 5,
    locations: ['ultimate_dungeon'],
    gatherTime: 35000,
    experience: 60,
    items: [{ itemId: 'abyssal_blade_resource', min: 1, max: 1, chance: 0.1 }]
  },

  dragon_kings_horn: {
    id: 'dragon_kings_horn',
    name: 'قرن ملك التنين',
    description: 'قرن قوي من ملك التنانين.',
    rarity: 'legendary',
    difficultyLevel: 5,
    locations: ['double_dungeon'],
    gatherTime: 30000,
    experience: 55,
    items: [{ itemId: 'dragon_kings_horn', min: 1, max: 1, chance: 0.2 }]
  },

  dark_abyss_core: {
    id: 'dark_abyss_core',
    name: 'جوهر الهاوية المظلمة',
    description: 'قلب الطاقة المظلمة من أعماق الهاوية.',
    rarity: 'mythic',
    difficultyLevel: 5,
    locations: ['ultimate_dungeon'],
    gatherTime: 40000,
    experience: 70,
    items: [{ itemId: 'dark_abyss_core', min: 1, max: 1, chance: 0.15 }]
  },

  infernal_ring: {
    id: 'infernal_ring',
    name: 'حلقة الجحيم',
    description: 'حلقة مشتعلة من الجحيم.',
    rarity: 'mythic',
    difficultyLevel: 5,
    locations: ['hell'],
    gatherTime: 35000,
    experience: 65,
    items: [{ itemId: 'infernal_ring', min: 1, max: 1, chance: 0.05 }]
  },

  gods_essence: {
    id: 'gods_essence',
    name: 'جوهر العظيم',
    description: 'الطاقة النقية العظيمة .',
    rarity: 'mythic',
    difficultyLevel: 5,
    locations: ['divine_dungeon'],
    gatherTime: 45000,
    experience: 80,
    items: [{ itemId: 'gods_essence', min: 1, max: 1, chance: 0.05 }]
  },

  sacred_steel: {
    id: 'sacred_steel',
    name: 'الصلب المقدس',
    description: 'معدن مقدس مصنوع من الشظايا الإلهية وأرواح الضوء.',
    rarity: 'mythic',
    difficultyLevel: 5,
    locations: ['heavenly_dungeon'],
    gatherTime: 38000,
    experience: 75,
    items: [{ itemId: 'sacred_steel', min: 1, max: 1, chance: 0.3 }],
    materials: [
      { id: 'divine_fragment', count: 3 },
      { id: 'soul_of_light', count: 5 }
    ]
  },

  // موارد خاصة من الأحداث
  broken_hero_sword: {
    id: 'broken_hero_sword',
    name: 'سيف البطل المكسور',
    description: 'بقايا سيف بطل قديم، يمكن إصلاحه.',
    rarity: 'legendary',
    difficultyLevel: 4,
    locations: ['solar_eclipse'],
    gatherTime: 20000,
    experience: 40,
    items: [{ itemId: 'broken_hero_sword', min: 1, max: 1, chance: 0.25 }]
  },

  // موارد من المخلوقات
  bone: {
    id: 'bone',
    name: 'عظم',
    description: 'عظام المخلوقات الميتة.',
    rarity: 'common',
    difficultyLevel: 1,
    locations: ['forest', 'cave'],
    gatherTime: 4000,
    experience: 5,
    items: [{ itemId: 'bone', min: 1, max: 2, chance: 1 }]
  },

  harpy_feather: {
    id: 'harpy_feather',
    name: 'ريشة هاربي',
    description: 'ريشة جميلة من مخلوقات السماء.',
    rarity: 'uncommon',
    difficultyLevel: 2,
    locations: ['sky'],
    gatherTime: 8000,
    experience: 12,
    items: [{ itemId: 'harpy_feather', min: 1, max: 2, chance: 0.5 }]
  },

  spider_web: {
    id: 'spider_web',
    name: 'شبكة عنكبوت',
    description: 'خيوط لزجة من العناكب العملاقة.',
    rarity: 'common',
    difficultyLevel: 2,
    locations: ['e_d_gates'],
    gatherTime: 6000,
    experience: 8,
    items: [{ itemId: 'spider_web', min: 1, max: 3, chance: 0.5 }]
  },

  // موارد التطوير المتقدمة
  hallowed_bar: {
    id: 'hallowed_bar',
    name: 'سبيكة مقدسة',
    description: 'سبيكة مصنوعة من مواد مقدسة.',
    rarity: 'epic',
    difficultyLevel: 4,
    locations: ['forge'],
    gatherTime: 18000,
    experience: 35,
    items: [{ itemId: 'hallowed_bar', min: 1, max: 1, chance: 1 }],
    materials: [
      { id: 'soul_of_light', count: 3 },
      { id: 'soul_of_might', count: 3 },
      { id: 'soul_of_fright', count: 3 }
    ]
  },

  nebula_fragments: {
    id: 'nebula_fragments',
    name: 'شظايا السديم',
    description: 'قطع من السديم الكوني.',
    rarity: 'legendary',
    difficultyLevel: 5,
    locations: ['lunar_temple'],
    gatherTime: 25000,
    experience: 45,
    items: [{ itemId: 'nebula_fragments', min: 2, max: 5, chance: 0.6 }]
  }
};
[file content end]
