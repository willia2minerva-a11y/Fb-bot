
import { resources } from './resources.js';

export const weapons = {
  // ===================================
  // الأسلحة الضعيفة إلى المتوسطة (Crafted & Found) - UPDATED
  // ===================================
  basic_pickaxe: {
    id: 'basic_pickaxe',
    name: 'فأس أساسي',
    type: 'tool',
    description: 'فأس بسيط لجمع الموارد.',
    efficiency: 1,
    rarity: 'common',
    level: 1
  },

  wooden_bow: {
    id: 'wooden_bow',
    name: 'قوس خشبي',
    type: 'weapon',
    description: 'قوس بسيط للرماة المبتدئين.',
    rarity: 'common',
    attack: 20,
    attackSpeed: 1.0,
    critChance: 3,
    level: 3,
    element: 'neutral',
    materials: [{ id: 'wood', count: 5 }, { id: 'iron_bar', count: 3 }]
  },

  bronze_dagger: {
    id: 'bronze_dagger',
    name: 'خنجر البرونز',
    type: 'weapon',
    description: 'خنجر حاد من البرونز.',
    rarity: 'common',
    attack: 15,
    attackSpeed: 1.6,
    critChance: 4,
    level: 2,
    element: 'neutral',
    materials: [{ id: 'bronze_bar', count: 5 }]
  },

  copper_shortsword: {
    id: 'copper_shortsword',
    name: 'سيف النحاس',
    type: 'weapon',
    description: 'سيف نحاسي أساسي.',
    rarity: 'common',
    attack: 14,
    attackSpeed: 1.2,
    critChance: 2,
    level: 3,
    element: 'neutral',
    materials: [{ id: 'copper_bar', count: 7 }]
  },

  iron_shortsword: {
    id: 'iron_shortsword',
    name: 'سيف الحديد',
    type: 'weapon',
    description: 'سيف حديدي بسيط.',
    rarity: 'common',
    attack: 16,
    attackSpeed: 1.1,
    critChance: 3,
    level: 4,
    element: 'neutral',
    materials: [{ id: 'iron_bar', count: 7 }]
  },

  lead_shortsword: {
    id: 'lead_shortsword',
    name: 'سيف الرصاص',
    type: 'weapon',
    description: 'سيف ثقيل نسبياً.',
    rarity: 'common',
    attack: 18,
    attackSpeed: 0.95,
    critChance: 2,
    level: 5,
    element: 'neutral',
    materials: [{ id: 'lead_bar', count: 7 }]
  },

  silver_shortsword: {
    id: 'silver_shortsword',
    name: 'سيف الفضة',
    type: 'weapon',
    description: 'سيف فضي جيد.',
    rarity: 'uncommon',
    attack: 28,
    attackSpeed: 1.15,
    critChance: 4,
    level: 8,
    element: 'holy',
    materials: [{ id: 'silver_bar', count: 7 }]
  },

  gold_shortsword: {
    id: 'gold_shortsword',
    name: 'سيف الذهب',
    type: 'weapon',
    description: 'سيف ذهبي، أكثر قيمة من القوة.',
    rarity: 'uncommon',
    attack: 30,
    attackSpeed: 1.05,
    critChance: 5,
    level: 9,
    element: 'holy',
    materials: [{ id: 'gold_bar', count: 7 }]
  },

  platinum_shortsword: {
    id: 'platinum_shortsword',
    name: 'سيف البلاتين',
    type: 'weapon',
    description: 'سيف عالي الجودة للمبتدئين.',
    rarity: 'uncommon',
    attack: 33,
    attackSpeed: 1.1,
    critChance: 5,
    level: 10,
    element: 'neutral',
    materials: [{ id: 'platinum_bar', count: 7 }]
  },

  iron_sword: {
    id: 'iron_sword',
    name: 'سيف الحديد',
    type: 'weapon',
    description: 'سيف حديدي قياسي.',
    rarity: 'uncommon',
    attack: 25,
    attackSpeed: 1.0,
    critChance: 6,
    level: 12,
    element: 'neutral',
    materials: [{ id: 'iron_bar', count: 8 }]
  },

  steel_mace: {
    id: 'steel_mace',
    name: 'مطرقة الصلب',
    type: 'weapon',
    description: 'مطرقة ثقيلة من الصلب.',
    rarity: 'uncommon',
    attack: 35,
    attackSpeed: 0.8,
    critChance: 4,
    level: 16,
    element: 'physical',
    materials: [{ id: 'steel_bar', count: 10 }]
  },

  silver_sword: {
    id: 'silver_sword',
    name: 'سيف الفضة',
    type: 'weapon',
    description: 'سيف فضي حاد.',
    rarity: 'rare',
    attack: 40,
    attackSpeed: 1.15,
    critChance: 7,
    level: 20,
    element: 'holy',
    materials: [{ id: 'silver_bar', count: 7 }]
  },

  silver_bow: {
    id: 'silver_bow',
    name: 'قوس الفضة',
    type: 'weapon',
    description: 'قوس مصنوع من الفضة.',
    rarity: 'rare',
    attack: 45,
    attackSpeed: 1.1,
    critChance: 8,
    level: 22,
    element: 'holy',
    materials: [{ id: 'silver_bar', count: 8 }, { id: 'wood', count: 5 }]
  },

  // ===================================
  // الأسلحة المتوسطة - القوية - UPDATED
  // ===================================
  fiery_greatsword: {
    id: 'fiery_greatsword',
    name: 'السيف العظيم الناري',
    type: 'weapon',
    description: 'سيف عملاق مشتعل.',
    rarity: 'rare',
    attack: 48,
    attackSpeed: 0.85,
    critChance: 8,
    level: 28,
    element: 'fire',
    materials: [{ id: 'hellstone_bar', count: 20 }]
  },

  enchanted_sword: {
    id: 'enchanted_sword',
    name: 'السيف المسحور',
    type: 'weapon',
    description: 'سيف قديم يحتوي على تأثيرات سحرية.',
    rarity: 'rare',
    attack: 50,
    attackSpeed: 1.05,
    critChance: 10,
    level: 30,
    element: 'arcane',
    source: 'magic_caves'
  },

  muramasa: {
    id: 'muramasa',
    name: 'موراماسا',
    type: 'weapon',
    description: 'سيف ياباني أسطوري، سريع جداً.',
    rarity: 'rare',
    attack: 45,
    attackSpeed: 1.6,
    critChance: 12,
    level: 30,
    element: 'slashing',
    source: 'old_temple_chests'
  },

  the_bee_keeper: {
    id: 'the_bee_keeper',
    name: 'حارس النحل',
    type: 'weapon',
    description: 'سيف يطلق نحل صغير عند الهجوم.',
    rarity: 'rare',
    attack: 40,
    attackSpeed: 1.2,
    critChance: 9,
    level: 26,
    element: 'nature',
    source: 'queen_bee',
    dropChance: 0.14
  },

  poisonous_dagger: {
    id: 'poisonous_dagger',
    name: 'خنجر السم',
    type: 'weapon',
    description: 'خنجر يسبب ضرر سمي.',
    rarity: 'rare',
    attack: 50,
    attackSpeed: 1.8,
    critChance: 10,
    level: 32,
    element: 'poison',
    source: 'ghoul',
    dropChance: 0.1
  },

  ice_blade: {
    id: 'ice_blade',
    name: 'سيف الجليد',
    type: 'weapon',
    description: 'يطلق نوبات ثلجية.',
    rarity: 'rare',
    attack: 55,
    attackSpeed: 1.05,
    critChance: 9,
    level: 34,
    element: 'ice',
    source: 'ice_demon',
    dropChance: 0.25
  },

  flame_staff: {
    id: 'flame_staff',
    name: 'عصا اللهب',
    type: 'weapon',
    description: 'عصا سحرية تطلق كرات نار.',
    rarity: 'rare',
    attack: 60,
    attackSpeed: 0.9,
    critChance: 6,
    level: 36,
    element: 'fire',
    source: 'fire_wyrm',
    dropChance: 0.2
  },

  trident: {
    id: 'trident',
    name: 'الرمح (Trident)',
    type: 'weapon',
    description: 'رمح ثلاثي الرؤوس يسقطه فيشرون.',
    rarity: 'epic',
    attack: 60,
    attackSpeed: 1.0,
    critChance: 10,
    level: 40,
    element: 'water',
    source: 'duke_fishron',
    dropChance: 0.25
  },

  dark_spear: {
    id: 'dark_spear',
    name: 'رمح الظلام',
    type: 'weapon',
    description: 'رمح يلفه الظلام.',
    rarity: 'epic',
    attack: 70,
    attackSpeed: 0.95,
    critChance: 12,
    level: 45,
    element: 'dark',
    source: 'dark_soldier',
    dropChance: 0.15
  },

  vampire_knives: {
    id: 'vampire_knives',
    name: 'خناجر مصاصة الدماء',
    type: 'weapon',
    description: 'تعيد جزء من الصحة عند الهجوم.',
    rarity: 'epic',
    attack: 75,
    attackSpeed: 2.0,
    critChance: 14,
    level: 48,
    element: 'life_steal',
    source: 'moon_lord',
    dropChance: 0.05
  },

  excalibur: {
    id: 'excalibur',
    name: 'إكسكالابور',
    type: 'weapon',
    description: 'السيف المقدس، قوي جداً.',
    rarity: 'epic',
    attack: 50,
    attackSpeed: 1.1,
    critChance: 12,
    level: 50,
    element: 'holy',
    materials: [{ id: 'hallowed_bar', count: 12 }]
  },

  nights_edge: {
    id: 'nights_edge',
    name: "حد السيف الليلي",
    type: 'weapon',
    description: 'دمج أربعة سيوف قوية.',
    rarity: 'epic',
    attack: 47,
    attackSpeed: 1.15,
    critChance: 13,
    level: 52,
    element: 'dark',
    materials: [
      { id: 'muramasa', count: 1 }, 
      { id: 'blade_of_grass', count: 1 }, 
      { id: 'fiery_greatsword', count: 1 },
      { id: 'true_excalibur', count: 1 }
    ]
  },

  // ===================================
  // الأسلحة القوية (Legendary & Mythical) - UPDATED
  // ===================================
  phantasm: {
    id: 'phantasm',
    name: 'الخيال (Phantasm)',
    type: 'weapon',
    description: 'قوس يطلق سهام أشباح.',
    rarity: 'legendary',
    attack: 120,
    attackSpeed: 1.6,
    critChance: 18,
    level: 70,
    element: 'spirit',
    source: 'the_twins',
    dropChance: 0.25
  },

  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'قاتل التنين',
    type: 'weapon',
    description: 'سيف مصمم لقتل التنانين.',
    rarity: 'legendary',
    attack: 120,
    attackSpeed: 1.0,
    critChance: 20,
    level: 75,
    element: 'physical',
    source: 'dragon_king',
    dropChance: 0.05
  },

  death_scythe: {
    id: 'death_scythe',
    name: 'منجل الموت',
    type: 'weapon',
    description: 'منجل يسحب أرواح الأعداء.',
    rarity: 'legendary',
    attack: 130,
    attackSpeed: 0.9,
    critChance: 20,
    level: 78,
    element: 'dark',
    source: 'death_knight',
    dropChance: 0.1
  },

  flame_dragons_blade: {
    id: 'flame_dragons_blade',
    name: 'سيف تنين اللهب',
    type: 'weapon',
    description: 'سيف يحمل قوة التنين.',
    rarity: 'legendary',
    attack: 150,
    attackSpeed: 1.0,
    critChance: 18,
    level: 80,
    element: 'fire',
    source: 'fire_wyrm',
    dropChance: 0.15
  },

  abyssal_edge: {
    id: 'abyssal_edge',
    name: 'حدود الهاوية',
    type: 'weapon',
    description: 'شفرة مظلمة لا نهاية لها.',
    rarity: 'legendary',
    attack: 160,
    attackSpeed: 1.05,
    critChance: 22,
    level: 85,
    element: 'void',
    source: 'abyssal_lord',
    dropChance: 0.1
  },

  razorblade_typhoon: {
    id: 'razorblade_typhoon',
    name: 'رازبليد تايفون',
    type: 'weapon',
    description: 'يطلق إعصار من الشفرات.',
    rarity: 'legendary',
    attack: 160,
    attackSpeed: 1.4,
    critChance: 20,
    level: 88,
    element: 'wind',
    materials: [
      { id: 'soul_of_sight', count: 5 }, 
      { id: 'soul_of_might', count: 5 }, 
      { id: 'soul_of_fright', count: 5 }, 
      { id: 'hallowed_bar', count: 10 }
    ]
  },

  phoenix_bow: {
    id: 'phoenix_bow',
    name: 'قوس الفينيق',
    type: 'weapon',
    description: 'يطلق سهام نارية متجددة.',
    rarity: 'legendary',
    attack: 170,
    attackSpeed: 1.3,
    critChance: 18,
    level: 90,
    element: 'fire',
    source: 'infernal_beast',
    dropChance: 0.1
  },

  daybreak: {
    id: 'daybreak',
    name: 'شروق الشمس',
    type: 'weapon',
    description: 'رمح يسبب ضرراً شمسيًا متواصلاً.',
    rarity: 'legendary',
    attack: 190,
    attackSpeed: 1.0,
    critChance: 22,
    level: 92,
    element: 'solar',
    source: 'solar_eclipse',
    dropChance: 0.15
  },

  terra_blade: {
    id: 'terra_blade',
    name: 'سيف الأرض',
    type: 'weapon',
    description: 'قوة الأرض الخارقة.',
    rarity: 'legendary',
    attack: 200,
    attackSpeed: 1.2,
    critChance: 25,
    level: 95,
    element: 'earth',
    materials: [
      { id: 'true_excalibur', count: 1 },
      { id: 'true_nights_edge', count: 1 }
    ]
  },

  celebration: {
    id: 'celebration',
    name: 'الاحتفال',
    type: 'weapon',
    description: 'تطلق صواريخ ملوّنة ومدمرة.',
    rarity: 'legendary',
    attack: 200,
    attackSpeed: 1.0,
    critChance: 15,
    level: 96,
    element: 'explosive',
    source: 'martian_saucer',
    dropChance: 0.3
  },

  nebula_blaze: {
    id: 'nebula_blaze',
    name: 'نبيولا بليز',
    type: 'weapon',
    description: 'قاذف سحري سريع.',
    rarity: 'legendary',
    attack: 210,
    attackSpeed: 2.2,
    critChance: 28,
    level: 98,
    element: 'nebula',
    materials: [{ id: 'nebula_fragments', count: 18 }]
  },

  daedalus_stormbow: {
    id: 'daedalus_stormbow',
    name: 'قوس العاصفة ديدالوس',
    type: 'weapon',
    description: 'يطلق سهام المطر.',
    rarity: 'legendary',
    attack: 250,
    attackSpeed: 1.8,
    critChance: 30,
    level: 99,
    element: 'storm',
    source: 'pumpkin_moon',
    dropChance: 0.15
  },

  the_deathbringer: {
    id: 'the_deathbringer',
    name: 'المؤتي بالموت',
    type: 'weapon',
    description: 'يستخدمه اللورد المظلم لإنهاء الحياة.',
    rarity: 'mythical',
    attack: 250,
    attackSpeed: 1.0,
    critChance: 35,
    level: 100,
    element: 'dark',
    source: 'dark_lord',
    dropChance: 0.05
  },

  star_wrath: {
    id: 'star_wrath',
    name: 'غضب النجم',
    type: 'weapon',
    description: 'يستدعي نجوماً من السماء.',
    rarity: 'mythical',
    attack: 300,
    attackSpeed: 1.0,
    critChance: 36,
    level: 100,
    element: 'cosmic',
    source: 'moon_lord',
    dropChance: 0.05
  },

  gods_wrath: {
    id: 'gods_wrath',
    name: 'غضب الظل',
    type: 'weapon',
    description: 'سلاح حاكم الظل.',
    rarity: 'mythical',
    attack: 300,
    attackSpeed: 1.05,
    critChance: 38,
    level: 100,
    element: 'divine',
    source: 'shadow_monarch',
    dropChance: 0.02
  },

  the_last_prism: {
    id: 'the_last_prism',
    name: 'البرسم الأخير',
    type: 'weapon',
    description: 'يطلق شعاع ليزر سحري متعدد الألوان.',
    rarity: 'mythical',
    attack: 300,
    attackSpeed: 1.7,
    critChance: 40,
    level: 100,
    element: 'prismatic',
    source: 'moon_lord',
    dropChance: 0.03
  },

  doomhammer: {
    id: 'doomhammer',
    name: 'مطرقة الهلاك',
    type: 'weapon',
    description: 'مطرقة التحطيم.',
    rarity: 'mythical',
    attack: 350,
    attackSpeed: 0.7,
    critChance: 30,
    level: 100,
    element: 'physical',
    source: 'monarch_of_destruction',
    dropChance: 0.01
  },

  divine_sword: {
    id: 'divine_sword',
    name: 'سيف الدمار',
    type: 'weapon',
    description: 'سيف مصنوع من مواد دمار.',
    rarity: 'mythical',
    attack: 400,
    attackSpeed: 1.2,
    critChance: 45,
    level: 100,
    element: 'divine',
    materials: [
      { id: 'divine_fragment', count: 5 }, 
      { id: 'sacred_steel', count: 10 }
    ]
  },

  soulfire_blade: {
    id: 'soulfire_blade',
    name: 'سيف نار الروح',
    type: 'weapon',
    description: 'شفرة مشتعلة بأرواح الأعداء.',
    rarity: 'mythical',
    attack: 500,
    attackSpeed: 1.1,
    critChance: 50,
    level: 100,
    element: 'soulfire',
    materials: [
      { id: 'soul_shard', count: 10 }, 
      { id: 'dark_iron', count: 15 }
    ]
  },

  oblivions_end: {
    id: 'oblivions_end',
    name: 'نهاية العدم',
    type: 'weapon',
    description: 'سلاح يتجاهل دفاعات العدو.',
    rarity: 'mythical',
    attack: 600,
    attackSpeed: 1.0,
    critChance: 60,
    level: 100,
    element: 'void',
    source: 'abyssal_overlord',
    dropChance: 0.01
  },

  divinitys_edge: {
    id: 'divinitys_edge',
    name: 'حدود الزعامة',
    type: 'weapon',
    description: 'سلاح الزعيم الأقوى.',
    rarity: 'mythical',
    attack: 700,
    attackSpeed: 1.3,
    critChance: 65,
    level: 100,
    element: 'divine',
    source: 'celestial_god',
    dropChance: 0.01
  },

  meowmere: {
    id: 'meowmere',
    name: 'الميومير',
    type: 'weapon',
    description: 'سيف مجنون يطلق رؤوس قطط مفرقعة.',
    rarity: 'mythical',
    attack: 200,
    attackSpeed: 1.4,
    critChance: 30,
    level: 98,
    element: 'chaos',
    source: 'moon_lord',
    dropChance: 0.11
  },

  // ===================================
  // أسلحة إضافية - NEW ADDITIONS
  // ===================================
  blade_of_grass: {
    id: 'blade_of_grass',
    name: 'شفرة العشب',
    type: 'weapon',
    description: 'سيف مصنوع من مواد الغابة.',
    rarity: 'uncommon',
    attack: 32,
    attackSpeed: 1.1,
    critChance: 6,
    level: 18,
    element: 'nature',
    materials: [
      { id: 'jungle_spores', count: 12 },
      { id: 'stinger', count: 15 }
    ]
  },

  true_excalibur: {
    id: 'true_excalibur',
    name: 'إكسكالابور الحقيقي',
    type: 'weapon',
    description: 'نسخة مطورة من إكسكالابور.',
    rarity: 'legendary',
    attack: 180,
    attackSpeed: 1.15,
    critChance: 15,
    level: 60,
    element: 'holy',
    materials: [
      { id: 'excalibur', count: 1 },
      { id: 'broken_hero_sword', count: 1 }
    ]
  },

  true_nights_edge: {
    id: 'true_nights_edge',
    name: 'حد السيف الليلي الحقيقي',
    type: 'weapon',
    description: 'نسخة مطورة من حد السيف الليلي.',
    rarity: 'legendary',
    attack: 185,
    attackSpeed: 1.2,
    critChance: 16,
    level: 62,
    element: 'dark',
    materials: [
      { id: 'nights_edge', count: 1 },
      { id: 'broken_hero_sword', count: 1 }
    ]
  },

  goblin_dagger: {
    id: 'goblin_dagger',
    name: 'خنجر الغوبلن',
    type: 'weapon',
    description: 'خنجر بدائي يستخدمه الغوبلن.',
    rarity: 'common',
    attack: 12,
    attackSpeed: 1.8,
    critChance: 5,
    level: 5,
    element: 'neutral',
    source: 'low_level_goblin',
    dropChance: 0.2
  },

  goblin_blade: {
    id: 'goblin_blade',
    name: 'سيف الغوبلن',
    type: 'weapon',
    description: 'سيف يستخدمه مقاتلو الغوبلن.',
    rarity: 'uncommon',
    attack: 35,
    attackSpeed: 1.0,
    critChance: 6,
    level: 12,
    element: 'neutral',
    source: 'goblin_warrior',
    dropChance: 0.25
  },

  phantom_sword: {
    id: 'phantom_sword',
    name: 'سيف الشبح',
    type: 'weapon',
    description: 'سيف شفاف يخترق الدروع.',
    rarity: 'rare',
    attack: 65,
    attackSpeed: 1.3,
    critChance: 12,
    level: 50,
    element: 'ghost',
    source: 'phantom_knight',
    dropChance: 0.25
  },

  dwarf_king_sword: {
    id: 'dwarf_king_sword',
    name: 'سيف ملك القزم',
    type: 'weapon',
    description: 'سيف قوي مصنوع في أعماق الجبال.',
    rarity: 'epic',
    attack: 85,
    attackSpeed: 0.9,
    critChance: 15,
    level: 55,
    element: 'earth',
    source: 'dwarf_king',
    dropChance: 0.1
  },

  igris_sword: {
    id: 'igris_sword',
    name: 'سيف إيغريت',
    type: 'weapon',
    description: 'سيف مشؤوم يقطر دماً.',
    rarity: 'legendary',
    attack: 140,
    attackSpeed: 1.1,
    critChance: 18,
    level: 105,
    element: 'blood',
    source: 'igris_the_bloodred',
    dropChance: 0.15
  },

  dark_lord_staff: {
    id: 'dark_lord_staff',
    name: 'عصا اللورد المظلم',
    type: 'weapon',
    description: 'عصا سحرية قوية من الظلام.',
    rarity: 'mythical',
    attack: 280,
    attackSpeed: 0.8,
    critChance: 25,
    level: 125,
    element: 'dark',
    source: 'dark_lord',
    dropChance: 0.1
  },

  abyssal_blade: {
    id: 'abyssal_blade',
    name: 'شفرة الهاوية',
    type: 'weapon',
    description: 'شفرة مصنوعة من قلب الهاوية.',
    rarity: 'mythical',
    attack: 320,
    attackSpeed: 1.0,
    critChance: 30,
    level: 135,
    element: 'void',
    source: 'abyssal_lord',
    dropChance: 0.08
  }
};
