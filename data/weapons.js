import { resources } from './resources.js';

export const weapons = {
  // ===================================
  // الأسلحة الضعيفة إلى المتوسطة (Crafted & Found)
  // تنسيق: attack, attackSpeed (هجمات/ثانية), critChance (%), level, element
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
    attack: 18,
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
    attack: 12,
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
    attack: 40,
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
    attack: 50,
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
    attack: 60,
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
    attack: 65,
    attackSpeed: 1.1,
    critChance: 8,
    level: 22,
    element: 'holy',
    materials: [{ id: 'silver_bar', count: 8 }, { id: 'wood', count: 5 }]
  },

  fiery_greatsword: {
    id: 'fiery_greatsword',
    name: 'السيف العظيم الناري',
    type: 'weapon',
    description: 'سيف عملاق مشتعل.',
    rarity: 'rare',
    attack: 80,
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
    attack: 85,
    attackSpeed: 1.05,
    critChance: 10,
    level: 30,
    element: 'arcane'
  },

  muramasa: {
    id: 'muramasa',
    name: 'موراماسا',
    type: 'weapon',
    description: 'سيف ياباني أسطوري، سريع جداً.',
    rarity: 'rare',
    attack: 82,
    attackSpeed: 1.6,
    critChance: 12,
    level: 30,
    element: 'slashing'
  },

  // ===================================
  // الأسلحة المتوسطة - القوية
  // ===================================
  the_bee_keeper: {
    id: 'the_bee_keeper',
    name: 'حارس النحل',
    type: 'weapon',
    description: 'سيف يطلق نحل صغير عند الهجوم.',
    rarity: 'rare',
    attack: 78,
    attackSpeed: 1.2,
    critChance: 9,
    level: 26,
    element: 'nature'
  },

  poisonous_dagger: {
    id: 'poisonous_dagger',
    name: 'خنجر السم',
    type: 'weapon',
    description: 'خنجر يسبب ضرر سمي.',
    rarity: 'rare',
    attack: 88,
    attackSpeed: 1.8,
    critChance: 10,
    level: 32,
    element: 'poison'
  },

  ice_blade: {
    id: 'ice_blade',
    name: 'سيف الجليد',
    type: 'weapon',
    description: 'يطلق نوبات ثلجية.',
    rarity: 'rare',
    attack: 95,
    attackSpeed: 1.05,
    critChance: 9,
    level: 34,
    element: 'ice'
  },

  flame_staff: {
    id: 'flame_staff',
    name: 'عصا اللهب',
    type: 'weapon',
    description: 'عصا سحرية تطلق كرات نار.',
    rarity: 'rare',
    attack: 100,
    attackSpeed: 0.9,
    critChance: 6,
    level: 36,
    element: 'fire'
  },

  trident: {
    id: 'trident',
    name: 'الرمح (Trident)',
    type: 'weapon',
    description: 'رمح ثلاثي الرؤوس يسقطه فيشرون.',
    rarity: 'epic',
    attack: 110,
    attackSpeed: 1.0,
    critChance: 10,
    level: 40,
    element: 'water'
  },

  dark_spear: {
    id: 'dark_spear',
    name: 'رمح الظلام',
    type: 'weapon',
    description: 'رمح يلفه الظلام.',
    rarity: 'epic',
    attack: 125,
    attackSpeed: 0.95,
    critChance: 12,
    level: 45,
    element: 'dark'
  },

  vampire_knives: {
    id: 'vampire_knives',
    name: 'خناجر مصاصة الدماء',
    type: 'weapon',
    description: 'تعيد جزء من الصحة عند الهجوم.',
    rarity: 'epic',
    attack: 135,
    attackSpeed: 2.0,
    critChance: 14,
    level: 48,
    element: 'life_steal'
  },

  excalibur: {
    id: 'excalibur',
    name: 'إكسكالابور',
    type: 'weapon',
    description: 'السيف المقدس، قوي جداً.',
    rarity: 'epic',
    attack: 150,
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
    attack: 155,
    attackSpeed: 1.15,
    critChance: 13,
    level: 52,
    element: 'dark',
    materials: [{ id: 'muramasa', count: 1 }, { id: 'blade_of_grass', count: 1 }, { id: 'fiery_greatsword', count: 1 }]
  },

  // ===================================
  // الأسلحة القوية (Legendary & Mythical)
  // ===================================
  phantasm: {
    id: 'phantasm',
    name: 'الخيال (Phantasm)',
    type: 'weapon',
    description: 'قوس يطلق سهام أشباح.',
    rarity: 'legendary',
    attack: 220,
    attackSpeed: 1.6,
    critChance: 18,
    level: 70,
    element: 'spirit'
  },

  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'قاتل التنين',
    type: 'weapon',
    description: 'سيف مصمم لقتل التنانين.',
    rarity: 'legendary',
    attack: 230,
    attackSpeed: 1.0,
    critChance: 20,
    level: 75,
    element: 'physical'
  },

  death_scythe: {
    id: 'death_scythe',
    name: 'منجل الموت',
    type: 'weapon',
    description: 'منجل يسحب أرواح الأعداء.',
    rarity: 'legendary',
    attack: 240,
    attackSpeed: 0.9,
    critChance: 20,
    level: 78,
    element: 'dark'
  },

  flame_dragons_blade: {
    id: 'flame_dragons_blade',
    name: 'سيف تنين اللهب',
    type: 'weapon',
    description: 'سيف يحمل قوة التنين.',
    rarity: 'legendary',
    attack: 260,
    attackSpeed: 1.0,
    critChance: 18,
    level: 80,
    element: 'fire'
  },

  abyssal_edge: {
    id: 'abyssal_edge',
    name: 'حدود الهاوية',
    type: 'weapon',
    description: 'شفرة مظلمة لا نهاية لها.',
    rarity: 'legendary',
    attack: 280,
    attackSpeed: 1.05,
    critChance: 22,
    level: 85,
    element: 'void'
  },

  razorblade_typhoon: {
    id: 'razorblade_typhoon',
    name: 'رازبليد تايفون',
    type: 'weapon',
    description: 'يطلق إعصار من الشفرات.',
    rarity: 'legendary',
    attack: 300,
    attackSpeed: 1.4,
    critChance: 20,
    level: 88,
    element: 'wind',
    materials: [{ id: 'soul_of_sight', count: 5 }, { id: 'soul_of_might', count: 5 }, { id: 'soul_of_fright', count: 5 }, { id: 'hallowed_bar', count: 10 }]
  },

  phoenix_bow: {
    id: 'phoenix_bow',
    name: 'قوس الفينيق',
    type: 'weapon',
    description: 'يطلق سهام نارية متجددة.',
    rarity: 'legendary',
    attack: 320,
    attackSpeed: 1.3,
    critChance: 18,
    level: 90,
    element: 'fire'
  },

  daybreak: {
    id: 'daybreak',
    name: 'شروق الشمس',
    type: 'weapon',
    description: 'رمح يسبب ضرراً شمسيًا متواصلاً.',
    rarity: 'legendary',
    attack: 340,
    attackSpeed: 1.0,
    critChance: 22,
    level: 92,
    element: 'solar'
  },

  terra_blade: {
    id: 'terra_blade',
    name: 'سيف الأرض',
    type: 'weapon',
    description: 'قوة الأرض الخارقة.',
    rarity: 'legendary',
    attack: 360,
    attackSpeed: 1.2,
    critChance: 25,
    level: 95,
    element: 'earth'
  },

  celebration: {
    id: 'celebration',
    name: 'الاحتفال',
    type: 'weapon',
    description: 'تطلق صواريخ ملوّنة ومدمرة.',
    rarity: 'legendary',
    attack: 380,
    attackSpeed: 1.0,
    critChance: 15,
    level: 96,
    element: 'explosive'
  },

  nebula_blaze: {
    id: 'nebula_blaze',
    name: 'نبيولا بليز',
    type: 'weapon',
    description: 'قاذف سحري سريع.',
    rarity: 'legendary',
    attack: 420,
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
    attack: 460,
    attackSpeed: 1.8,
    critChance: 30,
    level: 99,
    element: 'storm'
  },

  the_deathbringer: {
    id: 'the_deathbringer',
    name: 'المؤتي بالموت',
    type: 'weapon',
    description: 'يستخدمه اللورد المظلم لإنهاء الحياة.',
    rarity: 'mythical',
    attack: 520,
    attackSpeed: 1.0,
    critChance: 35,
    level: 100,
    element: 'dark'
  },

  star_wrath: {
    id: 'star_wrath',
    name: 'غضب النجم',
    type: 'weapon',
    description: 'يستدعي نجوماً من السماء.',
    rarity: 'mythical',
    attack: 560,
    attackSpeed: 1.0,
    critChance: 36,
    level: 100,
    element: 'cosmic'
  },

  gods_wrath: {
    id: 'gods_wrath',
    name: 'غضب الإله',
    type: 'weapon',
    description: 'سلاح حاكم الظل.',
    rarity: 'mythical',
    attack: 600,
    attackSpeed: 1.05,
    critChance: 38,
    level: 100,
    element: 'divine'
  },

  the_last_prism: {
    id: 'the_last_prism',
    name: 'البرسم الأخير',
    type: 'weapon',
    description: 'يطلق شعاع ليزر سحري متعدد الألوان.',
    rarity: 'mythical',
    attack: 650,
    attackSpeed: 1.7,
    critChance: 40,
    level: 100,
    element: 'prismatic'
  },

  doomhammer: {
    id: 'doomhammer',
    name: 'مطرقة الهلاك',
    type: 'weapon',
    description: 'مطرقة حاكم التحطيم.',
    rarity: 'mythical',
    attack: 700,
    attackSpeed: 0.7,
    critChance: 30,
    level: 100,
    element: 'physical'
  },

  divine_sword: {
    id: 'divine_sword',
    name: 'سيف الإله',
    type: 'weapon',
    description: 'سيف مصنوع من مواد إلهية.',
    rarity: 'mythical',
    attack: 800,
    attackSpeed: 1.2,
    critChance: 45,
    level: 100,
    element: 'divine',
    materials: [{ id: 'divine_fragments', count: 5 }, { id: 'sacred_steel', count: 10 }]
  },

  soulfire_blade: {
    id: 'soulfire_blade',
    name: 'سيف نار الروح',
    type: 'weapon',
    description: 'شفرة مشتعلة بأرواح الأعداء.',
    rarity: 'mythical',
    attack: 900,
    attackSpeed: 1.1,
    critChance: 50,
    level: 100,
    element: 'soulfire',
    materials: [{ id: 'soul_shards', count: 10 }, { id: 'dark_iron', count: 15 }]
  },

  oblivions_end: {
    id: 'oblivions_end',
    name: 'نهاية العدم',
    type: 'weapon',
    description: 'سلاح يتجاهل دفاعات العدو.',
    rarity: 'mythical',
    attack: 1100,
    attackSpeed: 1.0,
    critChance: 60,
    level: 100,
    element: 'void'
  },

  divinitys_edge: {
    id: 'divinitys_edge',
    name: 'حدود الإلوهية',
    type: 'weapon',
    description: 'سلاح الإله السماوي الأقوى.',
    rarity: 'mythical',
    attack: 1200,
    attackSpeed: 1.3,
    critChance: 65,
    level: 100,
    element: 'divine'
  },

  meowmere: {
    id: 'meowmere',
    name: 'الميومير',
    type: 'weapon',
    description: 'سيف مجنون يطلق رؤوس قطط مفرقعة.',
    rarity: 'mythical',
    attack: 400,
    attackSpeed: 1.4,
    critChance: 30,
    level: 98,
    element: 'chaos'
  }
};
