
export const monsters = {
  // ===================================
  // 1. وحوش ضعيفة (Level 1 - 5) - UPDATED
  // ===================================
  slime: {
    id: 'slime',
    name: 'الوحل (Slime)',
    level: 1,
    health: 50,
    maxHealth: 50,
    damage: 5,
    gold: 5,
    exp: 10,
    locations: ['forest', 'desert', 'plains'],
    spawnTime: 'day',
    drops: [
      { itemId: 'slime_gel', chance: 1.0, min: 1, max: 3 },
      { itemId: 'gold_coins', chance: 1.0, min: 1, max: 3 }
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
    locations: ['e_d_gates'],
    drops: [
      { itemId: 'goblin_dagger', chance: 0.2 },
      { itemId: 'gold_coins', chance: 1.0, min: 5, max: 10 }
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
    locations: ['forest', 'desert'],
    spawnTime: 'night',
    drops: [
      { itemId: 'demon_eye_banner', chance: 0.1 },
      { itemId: 'gold_coins', chance: 1.0, min: 1, max: 2 }
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
    locations: ['forest', 'desert'],
    spawnTime: 'night',
    drops: [
      { itemId: 'bone', chance: 1.0, min: 1, max: 2 }
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
    locations: ['forest', 'e_d_gates'],
    drops: [
      { itemId: 'wild_boar_tusk', chance: 0.1 },
      { itemId: 'raw_meat', chance: 0.5, min: 1, max: 2 }
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
    locations: ['forest', 'cave'],
    drops: [
      { itemId: 'bone', chance: 1.0, min: 1, max: 2 }
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
    locations: ['e_d_gates'],
    drops: [
      { itemId: 'spider_web', chance: 0.5, min: 1, max: 3 },
      { itemId: 'spider_fang', chance: 0.3 }
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
    locations: ['sky'],
    spawnTime: 'day',
    drops: [
      { itemId: 'harpy_feather', chance: 0.5 }
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
    locations: ['desert'],
    drops: [
      { itemId: 'vulture_feather', chance: 0.5 }
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
    locations: ['forest', 'cave'],
    drops: [
      { itemId: 'wiggly_worm', chance: 0.5 }
    ]
  },

  // ===================================
  // 2. وحوش متوسطة (Level 10 - 25) - UPDATED
  // ===================================
  goblin_warrior: {
    id: 'goblin_warrior',
    name: 'مقاتل الغوبلن',
    level: 10,
    health: 400,
    maxHealth: 400,
    damage: 40,
    gold: 80,
    exp: 150,
    locations: ['b_a_gates'],
    drops: [
      { itemId: 'goblin_blade', chance: 0.25 },
      { itemId: 'goblin_shield', chance: 0.3 }
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
    locations: ['c_b_gates'],
    drops: [
      { itemId: 'golem_heart', chance: 0.25 },
      { itemId: 'earth_shards', chance: 0.3, min: 1, max: 3 }
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
    locations: ['a_s_gates'],
    drops: [
      { itemId: 'ghoul_fangs', chance: 0.1 },
      { itemId: 'dark_crystal', chance: 0.05 }
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
    locations: ['hell', 's_rank_gates'],
    drops: [
      { itemId: 'fire_imp_flame', chance: 0.1 },
      { itemId: 'demon_horn', chance: 0.2 }
    ]
  },

  // ===================================
  // 3. زعماء متوسطي المستوى - UPDATED
  // ===================================
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
    locations: ['forest'],
    spawnCondition: 'slime_rain',
    drops: [
      { itemId: 'slime_king_mask', chance: 0.15 },
      { itemId: 'solidifier', chance: 0.3 },
      { itemId: 'slime_hook', chance: 0.05 },
      { itemId: 'royal_gel', chance: 0.1 }
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
    locations: ['forest', 'desert', 'plains'],
    drops: [
      { itemId: 'eye_of_cthulhu_mask', chance: 0.2 },
      { itemId: 'shield_of_cthulhu', chance: 0.1 }
    ]
  },
  queen_bee: {
    id: 'queen_bee',
    name: 'ملكة النحل (Queen Bee)',
    level: 40,
    health: 1200,
    maxHealth: 1200,
    damage: 100,
    gold: 1500,
    exp: 3000,
    isBoss: true,
    locations: ['underground_jungle'],
    spawnCondition: 'hive_destroyed',
    drops: [
      { itemId: 'bee_gun', chance: 0.05 },
      { itemId: 'bee_wax', chance: 0.3, min: 2, max: 5 },
      { itemId: 'honey', chance: 0.5, min: 3, max: 8 }
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
    locations: ['snow', 'underground_jungle'],
    spawnTime: 'winter',
    drops: [
      { itemId: 'ice_queen_mask', chance: 0.1 },
      { itemId: 'frozen_wings', chance: 0.25 },
      { itemId: 'snow_blocks', chance: 0.5, min: 10, max: 25 }
    ]
  },

  // ===================================
  // 4. وحوش قوية - NEW ADDITIONS
  // ===================================
  phantom_knight: {
    id: 'phantom_knight',
    name: 'فرسان الأشباح',
    level: 48,
    health: 3000,
    maxHealth: 3000,
    damage: 110,
    gold: 1500,
    exp: 3000,
    locations: ['s_rank_gates'],
    drops: [
      { itemId: 'phantom_sword', chance: 0.25 },
      { itemId: 'knight_armor', chance: 0.2 }
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
    locations: ['a_gates'],
    drops: [
      { itemId: 'dwarf_king_sword', chance: 0.1 },
      { itemId: 'dwarf_king_crown', chance: 0.05 }
    ]
  },
  ice_demon: {
    id: 'ice_demon',
    name: 'شيطان الجليد',
    level: 52,
    health: 3500,
    maxHealth: 3500,
    damage: 140,
    gold: 2200,
    exp: 4200,
    locations: ['c_a_gates'],
    drops: [
      { itemId: 'ice_blade', chance: 0.25 },
      { itemId: 'frost_essence', chance: 0.3 }
    ]
  },
  dark_soldier: {
    id: 'dark_soldier',
    name: 'الجندي المظلم',
    level: 55,
    health: 3800,
    maxHealth: 3800,
    damage: 150,
    gold: 2400,
    exp: 4500,
    locations: ['a_b_gates'],
    drops: [
      { itemId: 'dark_spear', chance: 0.15 },
      { itemId: 'dark_essence', chance: 0.4 }
    ]
  },

  // ===================================
  // 5. زعماء Hardmode - UPDATED
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
    locations: ['old_temple'],
    drops: [
      { itemId: 'bone', chance: 1.0, min: 15, max: 30 }
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
    locations: ['underground_jungle', 'jungle_temple'],
    spawnCondition: 'plantera_bulb_destroyed',
    drops: [
      { itemId: 'plantera_bulb', chance: 1.0 },
      { itemId: 'green_solution', chance: 0.25, min: 5, max: 10 }
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
    locations: ['jungle_temple', 'underground_jungle'],
    drops: [
      { itemId: 'golem_fist', chance: 0.05 },
      { itemId: 'lihzahrd_power_cell', chance: 1.0 },
      { itemId: 'golem_trophy', chance: 0.1 }
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
    locations: ['hell'],
    spawnCondition: 'guide_voodoo_doll',
    drops: [
      { itemId: 'pwnhammer', chance: 1.0 },
      { itemId: 'flesh_blocks', chance: 1.0, min: 50, max: 100 }
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
    locations: ['sky'],
    drops: [
      { itemId: 'wyvern_wings', chance: 0.1 },
      { itemId: 'souls_of_flight', chance: 1.0, min: 5, max: 10 }
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
    locations: ['ocean'],
    spawnCondition: 'truffle_worm',
    drops: [
      { itemId: 'fishron_wings', chance: 0.25 },
      { itemId: 'bubble_gun', chance: 0.2 },
      { itemId: 'fishron_mask', chance: 0.1 },
      { itemId: 'trident', chance: 0.25 }
    ]
  },

  // ===================================
  // 6. زعماء متقدمين - UPDATED
  // ===================================
  the_twins: {
    id: 'the_twins',
    name: 'التوأمان (The Twins)',
    level: 80,
    health: 8000,
    maxHealth: 8000,
    damage: 300,
    gold: 6000,
    exp: 12000,
    isBoss: true,
    locations: ['sky'],
    drops: [
      { itemId: 'twins_mask', chance: 0.15 },
      { itemId: 'spasm', chance: 0.3 },
      { itemId: 'soul_of_sight', chance: 1.0, min: 12, max: 20 },
      { itemId: 'phantasm', chance: 0.25 }
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
    locations: ['sky'],
    drops: [
      { itemId: 'saucer_core', chance: 0.1 },
      { itemId: 'martian_wings', chance: 0.3 },
      { itemId: 'alien_cells', chance: 0.25, min: 3, max: 8 },
      { itemId: 'celebration', chance: 0.3 }
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
    locations: ['sky'],
    drops: [
      { itemId: 'destroyer_core', chance: 0.1 },
      { itemId: 'destroyer_tail', chance: 0.05 },
      { itemId: 'soul_of_might', chance: 1.0, min: 15, max: 25 }
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
    locations: ['hallowed'],
    spawnTime: 'day',
    drops: [
      { itemId: 'empress_wings', chance: 0.15 },
      { itemId: 'empress_fury', chance: 0.1 },
      { itemId: 'daybreak', chance: 0.15 }
    ]
  },
  moon_lord: {
    id: 'moon_lord',
    name: 'قمر الملك (Moon Lord)',
    level: 100,
    health: 30000,
    maxHealth: 30000,
    damage: 450,
    gold: 12000,
    exp: 25000,
    isBoss: true,
    locations: ['lunar_temple'],
    drops: [
      { itemId: 'last_prism', chance: 0.03 },
      { itemId: 'moon_lord_mask', chance: 0.05 },
      { itemId: 'meowmere', chance: 0.11 },
      { itemId: 'star_wrath', chance: 0.05 },
      { itemId: 'vampire_knives', chance: 0.05 }
    ]
  },

  // ===================================
  // 7. الوحوش الأسطورية والنهائية - NEW ADDITIONS
  // ===================================
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
    locations: ['s_rank_gates', 'double_dungeon'],
    drops: [
      { itemId: 'cerberus_fur', chance: 0.1 },
      { itemId: 'cerberus_fang', chance: 0.15 }
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
    locations: ['s_rank_gates', 'double_dungeon'],
    drops: [
      { itemId: 'dragon_heart', chance: 0.05 },
      { itemId: 'wyrm_scale', chance: 0.3, min: 3, max: 8 },
      { itemId: 'dragon_fire_breath', chance: 0.1 }
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
    locations: ['s_rank_gates'],
    drops: [
      { itemId: 'dragon_fang', chance: 0.1 },
      { itemId: 'black_dragon_scale', chance: 0.2, min: 5, max: 12 },
      { itemId: 'dragon_fire_breath', chance: 0.15 }
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
    locations: ['dark_castle', 's_rank_gates'],
    drops: [
      { itemId: 'dark_lord_staff', chance: 0.1 },
      { itemId: 'dark_lord_mantle', chance: 0.05 },
      { itemId: 'the_deathbringer', chance: 0.05 }
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
    locations: ['hell'],
    drops: [
      { itemId: 'infernal_ring', chance: 0.05 },
      { itemId: 'hellish_soul', chance: 0.1 },
      { itemId: 'phoenix_bow', chance: 0.1 }
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
    locations: ['s_rank_gates'],
    drops: [
      { itemId: 'kamish_heart', chance: 0.1 },
      { itemId: 'kamish_scale', chance: 0.15, min: 5, max: 10 },
      { itemId: 'dragon_breath', chance: 0.05 }
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
    locations: ['magic_castle'],
    drops: [
      { itemId: 'shadow_monarch_orb', chance: 0.01 },
      { itemId: 'shadow_monarch_mantle', chance: 0.05 },
      { itemId: 'gods_wrath', chance: 0.02 }
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
    locations: ['rulers_castle'],
    drops: [
      { itemId: 'monarch_fist', chance: 0.01 },
      { itemId: 'destruction_ring', chance: 0.05 },
      { itemId: 'doomhammer', chance: 0.01 }
    ]
  },
  abyssal_lord: {
    id: 'abyssal_lord',
    name: 'رب الهاوية (Abyssal Lord)',
    level: 130,
    health: 18000,
    maxHealth: 18000,
    damage: 360,
    gold: 11000,
    exp: 22000,
    isBoss: true,
    locations: ['ultimate_dungeon'],
    drops: [
      { itemId: 'abyssal_edge', chance: 0.1 },
      { itemId: 'dark_abyss_core', chance: 0.15 },
      { itemId: 'abyssal_blade', chance: 0.08 }
    ]
  },
  celestial_god: {
    id: 'celestial_god',
    name: 'الإله السماوي (Celestial God)',
    level: 160,
    health: 22000,
    maxHealth: 22000,
    damage: 420,
    gold: 18000,
    exp: 35000,
    isBoss: true,
    locations: ['celestial_realm'],
    drops: [
      { itemId: 'divinitys_edge', chance: 0.01 },
      { itemId: 'gods_essence', chance: 0.05 },
      { itemId: 'celestial_fragment', chance: 0.3, min: 3, max: 8 }
    ]
  },
  soulfire_dragon: {
    id: 'soulfire_dragon',
    name: 'تنين نار الروح (Soulfire Dragon)',
    level: 140,
    health: 20000,
    maxHealth: 20000,
    damage: 390,
    gold: 13000,
    exp: 26000,
    isBoss: true,
    locations: ['final_stage'],
    drops: [
      { itemId: 'soul_shard', chance: 0.4, min: 5, max: 12 },
      { itemId: 'soulfire_blade', chance: 0.1 }
    ]
  },

  // ===================================
  // 8. وحوش أخرى (مناسبات/أحداث) - UPDATED
  // ===================================
  t Turkor_the_ungodly: {
    id: 'turkor_the_ungodly',
    name: 'تيركور اللاهوتي (Turkor the Ungodly)',
    level: 30,
    health: 8000,
    maxHealth: 8000,
    damage: 75,
    gold: 1000,
    exp: 2000,
    isBoss: true,
    locations: ['forest'],
    spawnCondition: 'thanksgiving',
    drops: [
      { itemId: 'wishbone', chance: 0.05 },
      { itemId: 'turkey_feather', chance: 0.2, min: 3, max: 8 }
    ]
  },
  martian_probe: {
    id: 'martian_probe',
    name: 'استكشاف المريخ (Martian Probe)',
    level: 50,
    health: 5000,
    maxHealth: 5000,
    damage: 10,
    gold: 500,
    exp: 1000,
    locations: ['sky'],
    drops: [
      { itemId: 'martian_beacon', chance: 1.0 }
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
    locations: ['lunar_temple'],
    drops: [
      { itemId: 'ancient_cultist_mask', chance: 0.2 },
      { itemId: 'cultist_staff', chance: 0.1 }
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
    locations: ['lunar_temple'],
    spawnCondition: 'solar_eclipse',
    drops: [
      { itemId: 'solar_eclipse_mask', chance: 0.15 },
      { itemId: 'broken_hero_sword', chance: 0.25 },
      { itemId: 'solar_fragment', chance: 0.4, min: 2, max: 6 }
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
    locations: ['order_castle'],
    drops: [
      { itemId: 'igris_sword', chance: 0.15 },
      { itemId: 'igris_armor', chance: 0.2 }
    ]
  },
  death_knight: {
    id: 'death_knight',
    name: 'فارس الموت (Death Knight)',
    level: 85,
    health: 7000,
    maxHealth: 7000,
    damage: 280,
    gold: 6500,
    exp: 13000,
    locations: ['dark_castle'],
    drops: [
      { itemId: 'death_scythe', chance: 0.1 },
      { itemId: 'soul_of_night', chance: 0.7, min: 3, max: 8 }
    ]
  },
  dragon_king: {
    id: 'dragon_king',
    name: 'ملك التنين (Dragon King)',
    level: 95,
    health: 12000,
    maxHealth: 12000,
    damage: 320,
    gold: 8500,
    exp: 17000,
    isBoss: true,
    locations: ['double_dungeon'],
    drops: [
      { itemId: 'dragon_slayer', chance: 0.05 },
      { itemId: 'dragon_kings_horn', chance: 0.2 }
    ]
  }
};
