export const monsters = {
  // ===================================
  // 1. وحوش ضعيفة (Level 1 - 5)
  // ===================================
  
  // الغابات، الصحراء، بوابات E-D
  slime: {
    id: 'slime',
    name: 'الوحل (Slime)',
    level: 1,
    health: 50,
    maxHealth: 50,
    damage: 5,
    gold: 5,
    exp: 10,
    drops: [
      { itemId: 'slime_gel', chance: 1.0 } // 100%
    ]
  },
  low_level_goblin: {
    id: 'low_level_goblin',
    name: 'غوبلن منخفض المستوى',
    level: 1,
    health: 50,
    maxHealth: 50,
    damage: 8,
    gold: 8,
    exp: 15,
    drops: [
      { itemId: 'goblin_dagger', chance: 0.2 }, // 20%
      { itemId: 'gold_coins_low', chance: 1.0 } 
    ]
  },
  demon_eye: {
    id: 'demon_eye',
    name: 'العين الشيطانية (Demon Eye)',
    level: 2,
    health: 180,
    maxHealth: 180,
    damage: 10,
    gold: 12,
    exp: 25,
    drops: [
      { itemId: 'demon_eye_banner', chance: 0.1 } // 10%
    ]
  },
  zombie: {
    id: 'zombie',
    name: 'زومبي (Zombie)',
    level: 2,
    health: 180,
    maxHealth: 180,
    damage: 12,
    gold: 15,
    exp: 30,
    drops: [
      { itemId: 'bone', chance: 1.0 } // 100%
    ]
  },
  wild_boar: {
    id: 'wild_boar',
    name: 'الخنزير البري',
    level: 3,
    health: 100,
    maxHealth: 100,
    damage: 15,
    gold: 18,
    exp: 35,
    drops: [
      { itemId: 'wild_boar_tusk', chance: 0.1 }, // 10%
      { itemId: 'meat', chance: 0.5 } // 50%
    ]
  },
  skeleton: {
    id: 'skeleton',
    name: 'الهياكل العظمية (Skeleton)',
    level: 3,
    health: 100,
    maxHealth: 100,
    damage: 10,
    gold: 10,
    exp: 20,
    drops: [
      { itemId: 'bone', chance: 1.0 } // 100%
    ]
  },
  giant_spiders: {
    id: 'giant_spiders',
    name: 'العناكب العملاقة',
    level: 4,
    health: 200,
    maxHealth: 200,
    damage: 18,
    gold: 20,
    exp: 40,
    drops: [
      { itemId: 'spider_web', chance: 0.5 }, // 50%
      { itemId: 'spider_fang', chance: 0.3 } // 30%
    ]
  },
  harpy: {
    id: 'harpy',
    name: 'هاربي (Harpy)',
    level: 5,
    health: 200,
    maxHealth: 200,
    damage: 20,
    gold: 25,
    exp: 50,
    drops: [
      { itemId: 'harpy_feather', chance: 0.5 } // 50%
    ]
  },
  vulture: {
    id: 'vulture',
    name: 'النسور (Vulture)',
    level: 5,
    health: 400,
    maxHealth: 400,
    damage: 25,
    gold: 30,
    exp: 60,
    drops: [
      { itemId: 'vulture_feather', chance: 0.5 } // 50%
    ]
  },
  worm: {
    id: 'worm',
    name: 'الدودة (Worm)',
    level: 5,
    health: 100,
    maxHealth: 100,
    damage: 15,
    gold: 10,
    exp: 20,
    drops: [
      { itemId: 'wiggly_worm', chance: 0.5 } // 50%
    ]
  },

  // ===================================
  // 2. وحوش متوسطة (Level 10 - 25)
  // ===================================
  
  // البوابات و المناطق المتوسطة
  goblin_warrior: {
    id: 'goblin_warrior',
    name: 'مقاتل الغوبلن',
    level: 10,
    health: 400,
    maxHealth: 400,
    damage: 40,
    gold: 80,
    exp: 150,
    drops: [
      { itemId: 'goblin_blade', chance: 0.25 }, // 25%
      { itemId: 'goblin_shield', chance: 0.3 } // 30%
    ]
  },
  stone_golem: {
    id: 'stone_golem',
    name: 'الغولم الحجري',
    level: 15,
    health: 1500,
    maxHealth: 1500,
    damage: 50,
    gold: 150,
    exp: 300,
    drops: [
      { itemId: 'golem_heart', chance: 0.25 }, // 25%
      { itemId: 'earth_shards', chance: 0.3 } // 30%
    ]
  },
  ghoul: {
    id: 'ghoul',
    name: 'غول (Ghoul)',
    level: 20,
    health: 1200,
    maxHealth: 1200,
    damage: 60,
    gold: 200,
    exp: 400,
    drops: [
      { itemId: 'ghoul_fangs', chance: 0.1 }, // 10%
      { itemId: 'dark_crystal', chance: 0.05 } // 5%
    ]
  },
  fire_imp: {
    id: 'fire_imp',
    name: 'الشيطان الناري (Fire Imp)',
    level: 25,
    health: 1000,
    maxHealth: 1000,
    damage: 70,
    gold: 250,
    exp: 500,
    drops: [
      { itemId: 'fire_imp_flame', chance: 0.1 }, // 10%
      { itemId: 'demon_horn', chance: 0.2 } // 20%
    ]
  },
  
  // ===================================
  // 3. الزعماء والوحوش القوية (Level 30 - 50)
  // ===================================
  
  // زعماء متوسطي المستوى
  king_slime: {
    id: 'king_slime',
    name: 'ملك الوحل (King Slime)',
    level: 30,
    health: 8000,
    maxHealth: 8000,
    damage: 80,
    gold: 1000,
    exp: 2000,
    isBoss: true,
    drops: [
      { itemId: 'slime_king_mask', chance: 0.15 }, // 15%
      { itemId: 'solidifier', chance: 0.3 }, // 30%
      { itemId: 'slime_hook', chance: 0.05 }, // 5%
      { itemId: 'royal_gel', chance: 0.1 } // 10%
    ]
  },
  eye_of_cthulhu: {
    id: 'eye_of_cthulhu',
    name: 'عين كاثولو (Eye of Cthulhu)',
    level: 35,
    health: 4000,
    maxHealth: 4000,
    damage: 90,
    gold: 1200,
    exp: 2500,
    isBoss: true,
    drops: [
      { itemId: 'eye_of_cthulhu_mask', chance: 0.2 }, // 20%
      { itemId: 'shield_of_cthulhu', chance: 0.1 } // 10%
    ]
  },
  queen_bee: {
    id: 'queen_bee',
    name: 'ملكة النحل (Queen Bee)',
    level: 40,
    health: 1200, // قد تكون قيمتها أقل لكونها زعيم سابق
    maxHealth: 1200,
    damage: 100,
    gold: 1500,
    exp: 3000,
    isBoss: true,
    drops: [
      { itemId: 'bee_gun', chance: 0.05 }, // 5%
      { itemId: 'bee_wax', chance: 0.3 }, // 30%
      { itemId: 'honey', chance: 0.5 } // 50%
    ]
  },
  ice_queen: {
    id: 'ice_queen',
    name: 'ملكة الثلج (Ice Queen)',
    level: 45,
    health: 4500,
    maxHealth: 4500,
    damage: 120,
    gold: 1800,
    exp: 3500,
    isBoss: true,
    drops: [
      { itemId: 'ice_queen_mask', chance: 0.1 }, // 10%
      { itemId: 'frozen_wings', chance: 0.25 }, // 25%
      { itemId: 'snow_blocks', chance: 0.5 } // 50%
    ]
  },
  phantom_knight: {
    id: 'phantom_knight',
    name: 'فرسان الأشباح',
    level: 48,
    health: 3000,
    maxHealth: 3000,
    damage: 110,
    gold: 1500,
    exp: 3000,
    drops: [
      { itemId: 'phantom_sword', chance: 0.25 }, // 25%
      { itemId: 'knight_armor', chance: 0.2 } // 20%
    ]
  },
  dwarf_king: {
    id: 'dwarf_king',
    name: 'ملك القزم',
    level: 50,
    health: 4000,
    maxHealth: 4000,
    damage: 130,
    gold: 2000,
    exp: 4000,
    drops: [
      { itemId: 'dwarf_king_sword', chance: 0.1 }, // 10%
      { itemId: 'dwarf_king_crown', chance: 0.05 } // 5%
    ]
  },
  
  // ===================================
  // 4. زعماء Hardmode و القلاع (Level 55 - 75)
  // ===================================

  skeletron: {
    id: 'skeletron',
    name: 'سكيليترون (Skeleton Temple)',
    level: 55,
    health: 4000,
    maxHealth: 4000,
    damage: 150,
    gold: 2500,
    exp: 5000,
    isBoss: true,
    drops: [
      { itemId: 'bone', chance: 1.0 } // 100%
    ]
  },
  plantera: {
    id: 'plantera',
    name: 'بلانتيرا (Plantera)',
    level: 60,
    health: 20000,
    maxHealth: 20000,
    damage: 180,
    gold: 3000,
    exp: 6000,
    isBoss: true,
    drops: [
      { itemId: 'plantera_bulb', chance: 1.0 }, // 100%
      { itemId: 'green_solution', chance: 0.25 } // 25%
    ]
  },
  golem: {
    id: 'golem',
    name: 'الغولم (Golem)',
    level: 65,
    health: 7000,
    maxHealth: 7000,
    damage: 200,
    gold: 3500,
    exp: 7000,
    isBoss: true,
    drops: [
      { itemId: 'golem_fist', chance: 0.05 }, // 5%
      { itemId: 'lihzahrd_power_cell', chance: 1.0 }, // 100%
      { itemId: 'golem_trophy', chance: 0.1 } // 10%
    ]
  },
  wall_of_flesh: {
    id: 'wall_of_flesh',
    name: 'جدار اللحم (Wall of Flesh)',
    level: 70,
    health: 8000,
    maxHealth: 8000,
    damage: 220,
    gold: 4000,
    exp: 8000,
    isBoss: true,
    drops: [
      { itemId: 'pwnhammer', chance: 1.0 }, // 100%
      { itemId: 'flesh_blocks', chance: 1.0 } 
    ]
  },
  wyvern: {
    id: 'wyvern',
    name: 'الوايفرن (Wyvern)',
    level: 70,
    health: 3000,
    maxHealth: 3000,
    damage: 150,
    gold: 2000,
    exp: 4000,
    drops: [
      { itemId: 'wyvern_wings', chance: 0.1 }, // 10%
      { itemId: 'souls_of_flight', chance: 1.0 } // 100%
    ]
  },
  duke_fishron: {
    id: 'duke_fishron',
    name: 'سمكة التنين المائية (Duke Fishron)',
    level: 75,
    health: 5000,
    maxHealth: 5000,
    damage: 250,
    gold: 5000,
    exp: 10000,
    isBoss: true,
    drops: [
      { itemId: 'fishron_wings', chance: 0.25 }, // 25%
      { itemId: 'bubble_gun', chance: 0.2 }, // 20%
      { itemId: 'fishron_mask', chance: 0.1 } // 10%
    ]
  },

  // ===================================
  // 5. وحوش وزعماء Hardmode المتقدمين (Level 80 - 100+)
  // ===================================

  the_twins: {
    id: 'the_twins',
    name: 'التوأمان (The Twins)',
    level: 80,
    health: 8000, // 4000 لكل واحد
    maxHealth: 8000,
    damage: 300,
    gold: 6000,
    exp: 12000,
    isBoss: true,
    drops: [
      { itemId: 'twins_mask', chance: 0.15 }, // 15%
      { itemId: 'spasm', chance: 0.3 }, // 30%
      { itemId: 'souls_of_sight_12x', chance: 1.0 } // 100%
    ]
  },
  martian_saucer: {
    id: 'martian_saucer',
    name: 'صحن المريخ (Martian Saucer)',
    level: 85,
    health: 10000,
    maxHealth: 10000,
    damage: 350,
    gold: 7000,
    exp: 14000,
    isBoss: true,
    drops: [
      { itemId: 'saucer_core', chance: 0.1 }, // 10%
      { itemId: 'martian_wings', chance: 0.3 }, // 30%
      { itemId: 'alien_cells', chance: 0.25 } // 25%
    ]
  },
  the_destroyer: {
    id: 'the_destroyer',
    name: 'المُدمر (The Destroyer)',
    level: 90,
    health: 8000,
    maxHealth: 8000,
    damage: 380,
    gold: 8000,
    exp: 16000,
    isBoss: true,
    drops: [
      { itemId: 'destroyer_core', chance: 0.1 }, // 10%
      { itemId: 'destroyer_tail', chance: 0.05 } // 5%
    ]
  },
  empress_of_light: {
    id: 'empress_of_light',
    name: 'إمبراطورة الضوء (Empress of Light)',
    level: 95,
    health: 25000,
    maxHealth: 25000,
    damage: 400,
    gold: 9000,
    exp: 18000,
    isBoss: true,
    drops: [
      { itemId: 'empress_wings', chance: 0.15 }, // 15%
      { itemId: 'empress_fury', chance: 0.1 } // 10%
    ]
  },
  
  // ===================================
  // 6. الوحوش الأسطورية والنهائية (Level 100+)
  // ===================================
  
  // وحوش البوابات S-Rank والزعماء النهائيين
  cerberus: {
    id: 'cerberus',
    name: 'سيربيروس (Cerberus)',
    level: 100,
    health: 10000,
    maxHealth: 10000,
    damage: 250,
    gold: 5000,
    exp: 10000,
    isBoss: true,
    drops: [
      { itemId: 'cerberus_fur', chance: 0.1 }, // 10%
      { itemId: 'cerberus_fang', chance: 0.15 } // 15%
    ]
  },
  dragon_wyrm: {
    id: 'dragon_wyrm',
    name: 'تنين الجرم (Dragon Wyrm)',
    level: 105,
    health: 8000,
    maxHealth: 8000,
    damage: 280,
    gold: 6000,
    exp: 12000,
    isBoss: true,
    drops: [
      { itemId: 'dragon_heart', chance: 0.05 }, // 5%
      { itemId: 'wyrm_scale', chance: 0.3 }, // 30%
      { itemId: 'dragon_fire_breath', chance: 0.1 } // 10%
    ]
  },
  black_dragon: {
    id: 'black_dragon',
    name: 'التنين الأسود (Black Dragon)',
    level: 110,
    health: 15000,
    maxHealth: 15000,
    damage: 320,
    gold: 8000,
    exp: 15000,
    isBoss: true,
    drops: [
      { itemId: 'dragon_fang', chance: 0.1 }, // 10%
      { itemId: 'black_dragon_scale', chance: 0.2 }, // 20%
      { itemId: 'dragon_fire_breath', chance: 0.15 } // 15%
    ]
  },
  dark_lord: {
    id: 'dark_lord',
    name: 'اللورد المظلم (Dark Lord)',
    level: 120,
    health: 12000,
    maxHealth: 12000,
    damage: 350,
    gold: 9000,
    exp: 18000,
    isBoss: true,
    drops: [
      { itemId: 'dark_lord_staff', chance: 0.1 }, // 10%
      { itemId: 'dark_lord_mantle', chance: 0.05 } // 5%
    ]
  },
  infernal_beast: {
    id: 'infernal_beast',
    name: 'الوحش الجهنمي (Infernal Beast)',
    level: 125,
    health: 25000,
    maxHealth: 25000,
    damage: 380,
    gold: 10000,
    exp: 20000,
    isBoss: true,
    drops: [
      { itemId: 'infernal_ring', chance: 0.05 }, // 5%
      { itemId: 'hellish_soul', chance: 0.1 } // 10%
    ]
  },
  kamish: {
    id: 'kamish',
    name: 'كاميش (Kamish)',
    level: 150,
    health: 10000,
    maxHealth: 10000,
    damage: 400,
    gold: 15000,
    exp: 30000,
    isBoss: true,
    drops: [
      { itemId: 'kamish_heart', chance: 0.1 }, // 10%
      { itemId: 'kamish_scale', chance: 0.15 }, // 15%
      { itemId: 'dragon_breath', chance: 0.05 } // 5%
    ]
  },
  shadow_monarch: {
    id: 'shadow_monarch',
    name: 'حاكم الظل (Shadow Monarch)',
    level: 180,
    health: 25000,
    maxHealth: 25000,
    damage: 450,
    gold: 20000,
    exp: 40000,
    isBoss: true,
    drops: [
      { itemId: 'shadow_monarch_orb', chance: 0.01 }, // 1%
      { itemId: 'shadow_monarch_mantle', chance: 0.05 } // 5%
    ]
  },
  monarch_of_destruction: {
    id: 'monarch_of_destruction',
    name: 'حاكم التحطيم (Monarch of Destruction)',
    level: 200,
    health: 20000,
    maxHealth: 20000,
    damage: 500,
    gold: 25000,
    exp: 50000,
    isBoss: true,
    drops: [
      { itemId: 'monarch_fist', chance: 0.01 }, // 1%
      { itemId: 'destruction_ring', chance: 0.05 } // 5%
    ]
  },
  
  // ===================================
  // 7. وحوش أخرى (مناسبات/أحداث)
  // ===================================

  turkor_the_ungodly: {
    id: 'turkor_the_ungodly',
    name: 'تيركور اللاهوتي (Turkor the Ungodly)',
    level: 30,
    health: 8000,
    maxHealth: 8000,
    damage: 75,
    gold: 1000,
    exp: 2000,
    isBoss: true,
    drops: [
      { itemId: 'wishbone', chance: 0.05 }, // 5%
      { itemId: 'turkey_feather', chance: 0.2 } // 20%
    ]
  },
  martian_probe: {
    id: 'martian_probe',
    name: 'استكشاف المريخ (Martian Probe)',
    level: 50,
    health: 5000,
    maxHealth: 5000,
    damage: 10, // يفضل أن يكون ضرره منخفض أو معدوم لأنه يطلق الحدث
    gold: 500,
    exp: 1000,
    drops: [
      { itemId: 'martian_beacon', chance: 1.0 } // 100%
    ]
  },
  cultists: {
    id: 'cultists',
    name: 'الطائفة (Cultists)',
    level: 55,
    health: 1000,
    maxHealth: 1000,
    damage: 100,
    gold: 500,
    exp: 1000,
    drops: [
      { itemId: 'ancient_cultist_mask', chance: 0.2 }, // 20%
      { itemId: 'cultist_staff', chance: 0.1 } // 10%
    ]
  },
  solar_eclipse_mob: {
    id: 'solar_eclipse_mob',
    name: 'وحش الكسوف الشمسي',
    level: 70,
    health: 6000,
    maxHealth: 6000,
    damage: 180,
    gold: 2000,
    exp: 4000,
    drops: [
      { itemId: 'solar_eclipse_mask', chance: 0.15 }, // 15%
      { itemId: 'broken_hero_sword', chance: 0.25 } // 25%
    ]
  },
  igris_the_bloodred: {
    id: 'igris_the_bloodred',
    name: 'إيغريت المشؤوم (Igris the Bloodred)',
    level: 100,
    health: 5000,
    maxHealth: 5000,
    damage: 250,
    gold: 7000,
    exp: 14000,
    isBoss: true,
    drops: [
      { itemId: 'igris_sword', chance: 0.15 }, // 15%
      { itemId: 'igris_armor', chance: 0.2 } // 20%
    ]
  }
};
