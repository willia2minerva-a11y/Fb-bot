// data/recipes.js

/**
 * قاموس وصفات الصناعة (Recipe Dictionary)
 * المفتاح (key): هو ID المنتج النهائي (items.js)
 * القيمة (value): تحتوي على اسم الوصفة باللغة العربية، والمواد المطلوبة (ID: quantity).
 */
export const recipes = {
  // ===================================
  // 1. أسلحة المرحلة الأولى (نحاس، حديد، فضة)
  // ===================================
  'wooden_bow': {
    id: 'wooden_bow',
    name: 'قوس خشبي',
    materials: { 'wood': 5, 'iron_bar': 3 },
    requiredLevel: 1
  },
  'bronze_dagger': {
    id: 'bronze_dagger',
    name: 'خنجر البرونز',
    materials: { 'bronze_bar': 5 },
    requiredLevel: 1
  },
  'copper_shortsword': {
    id: 'copper_shortsword',
    name: 'سيف النحاس',
    materials: { 'copper_bar': 7 },
    requiredLevel: 1
  },
  'iron_shortsword': {
    id: 'iron_shortsword',
    name: 'سيف الحديد',
    materials: { 'iron_bar': 7 },
    requiredLevel: 2
  },
  'lead_shortsword': {
    id: 'lead_shortsword',
    name: 'سيف الرصاص',
    materials: { 'lead_bar': 7 },
    requiredLevel: 2
  },
  'silver_shortsword': {
    id: 'silver_shortsword',
    name: 'سيف الفضة',
    materials: { 'silver_bar': 7 },
    requiredLevel: 3
  },
  'gold_shortsword': {
    id: 'gold_shortsword',
    name: 'سيف الذهب',
    materials: { 'gold_bar': 7 },
    requiredLevel: 3
  },
  'platinum_shortsword': {
    id: 'platinum_shortsword',
    name: 'سيف البلاتين',
    materials: { 'platinum_bar': 7 },
    requiredLevel: 4
  },
  'silver_bow': {
    id: 'silver_bow',
    name: 'قوس الفضة',
    materials: { 'silver_bar': 8, 'wood': 5 },
    requiredLevel: 5
  },
  
  // ===================================
  // 2. أسلحة متقدمة (دمج و Hellstone)
  // ===================================
  'fiery_greatsword': {
    id: 'fiery_greatsword',
    name: 'السيف العظيم الناري',
    materials: { 'hellstone_bar': 20 },
    requiredLevel: 20
  },
  'nights_edge': {
    id: 'nights_edge',
    name: 'حد السيف الليلي',
    // 💡 افتراض وجود هذه السيوف كعناصر في المخزون
    materials: { 'muramasa': 1, 'blade_of_grass': 1, 'fiery_greatsword': 1, 'true_excalibur': 1 }, 
    requiredLevel: 35
  },
  'excalibur': {
    id: 'excalibur',
    name: 'إكسكالابور',
    materials: { 'hallowed_bar': 12 },
    requiredLevel: 40
  },
  
  // ===================================
  // 3. أسلحة أسطورية (Souls & Fragments)
  // ===================================
  'wyvern_wings': {
    id: 'wyvern_wings',
    name: 'أجنحة الوايفرن',
    materials: { 'souls_of_flight': 20, 'platinum_bar': 15 },
    requiredLevel: 45,
    requiredSkill: 5 // يتطلب مهارة عالية في الصناعة
  },
  'terra_blade': {
    id: 'terra_blade',
    name: 'سيف الأرض',
    materials: { 'true_excalibur': 1, 'true_nights_edge': 1 },
    requiredLevel: 60
  },
  'divine_sword': {
    id: 'divine_sword',
    name: 'سيف الإله',
    materials: { 'divine_fragment': 5, 'sacred_steel': 10 },
    requiredLevel: 75
  },
  'soulfire_blade': {
    id: 'soulfire_blade',
    name: 'سيف نار الروح',
    materials: { 'soul_shards': 10, 'dark_iron': 15 },
    requiredLevel: 80
  }
};
