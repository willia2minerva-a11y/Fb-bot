// data/crafting.js

/**
 * قاموس وصفات الصناعة
 * المفتاح (key): هو ID المنتج النهائي (items.js)
 * القيمة (value): هي قائمة المواد المطلوبة (items.js IDs) مع الكمية
 */
export const craftingRecipes = {
  // ===================================
  // 1. أسلحة بسيطة (الخامات الأساسية)
  // ===================================
  wooden_bow: {
    name: 'قوس خشبي',
    materials: [
      { id: 'wood', quantity: 5 },
      { id: 'iron_bar', quantity: 3 }
    ],
    requiredTool: 'basic_pickaxe' // مثال على متطلبات أداة
  },
  bronze_dagger: {
    name: 'خنجر البرونز',
    materials: [
      { id: 'bronze_bar', quantity: 5 }
    ]
  },
  copper_shortsword: {
    name: 'سيف النحاس',
    materials: [
      { id: 'copper_bar', quantity: 7 }
    ]
  },
  iron_shortsword: {
    name: 'سيف الحديد',
    materials: [
      { id: 'iron_bar', quantity: 7 }
    ]
  },
  lead_shortsword: {
    name: 'سيف الرصاص',
    materials: [
      { id: 'lead_bar', quantity: 7 }
    ]
  },
  silver_shortsword: {
    name: 'سيف الفضة',
    materials: [
      { id: 'silver_bar', quantity: 7 }
    ]
  },
  gold_shortsword: {
    name: 'سيف الذهب',
    materials: [
      { id: 'gold_bar', quantity: 7 }
    ]
  },
  platinum_shortsword: {
    name: 'سيف البلاتين',
    materials: [
      { id: 'platinum_bar', quantity: 7 }
    ]
  },
  iron_sword: {
    name: 'سيف الحديد',
    materials: [
      { id: 'iron_bar', quantity: 8 }
    ]
  },
  steel_mace: {
    name: 'مطرقة الصلب',
    materials: [
      { id: 'steel_bar', quantity: 10 }
    ]
  },
  silver_sword: {
    name: 'سيف الفضة',
    materials: [
      { id: 'silver_bar', quantity: 7 }
    ]
  },
  silver_bow: {
    name: 'قوس الفضة',
    materials: [
      { id: 'silver_bar', quantity: 8 },
      { id: 'wood', quantity: 5 }
    ]
  },
  fiery_greatsword: {
    name: 'السيف العظيم الناري',
    materials: [
      { id: 'hellstone_bar', quantity: 20 }
    ]
  },
  
  // ===================================
  // 2. أسلحة متوسطة إلى متقدمة (Boss & High Tier)
  // ===================================
  excalibur: {
    name: 'إكسكالابور (Hardmode)',
    materials: [
      { id: 'hallowed_bar', quantity: 12 }
    ]
  },
  nights_edge: {
    name: 'حد السيف الليلي',
    materials: [
      { id: 'muramasa', quantity: 1 },
      { id: 'blade_of_grass', quantity: 1 }, // (يفترض وجودها كـ ID)
      { id: 'fiery_greatsword', quantity: 1 },
      { id: 'true_excalibur', quantity: 1 } // (يفترض وجودها كـ ID)
    ]
  },
  razorblade_typhoon: {
    name: 'رازبليد تايفون',
    materials: [
      { id: 'soul_of_sight', quantity: 5 },
      { id: 'soul_of_might', quantity: 5 },
      { id: 'soul_of_fright', quantity: 5 }, // (يفترض وجودها كـ ID)
      { id: 'hallowed_bar', quantity: 10 }
    ]
  },
  nebula_blaze: {
    name: 'نبيولا بليز',
    materials: [
      { id: 'nebula_fragments', quantity: 18 }
    ]
  },
  
  // ===================================
  // 3. الأسلحة الأسطورية والنهائية
  // ===================================
  terra_blade: {
    name: 'سيف الأرض',
    materials: [
      { id: 'true_excalibur', quantity: 1 }, // (يفترض وجودها كـ ID)
      { id: 'true_nights_edge', quantity: 1 } // (يفترض وجودها كـ ID)
    ]
  },
  divine_sword: {
    name: 'سيف الإله',
    materials: [
      { id: 'divine_fragment', quantity: 5 },
      { id: 'sacred_steel', quantity: 10 }
    ]
  },
  soulfire_blade: {
    name: 'سيف نار الروح',
    materials: [
      { id: 'soul_shards', quantity: 10 },
      { id: 'dark_iron', quantity: 15 }
    ]
  },
};
