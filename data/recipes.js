// data/recipes.js

/**
 * قاموس وصفات الصناعة (Recipe Dictionary)
 * المفتاح (key): هو ID المنتج النهائي (items.js)
 * القيمة (value): تحتوي على اسم الوصفة باللغة العربية، والمواد المطلوبة (ID: quantity).
 */
export const recipes = {
  // ===================================
  // 🆕 0. بناء محطة العمل (الفرن)
  // ===================================
  'furnace': {
    id: 'furnace',
    name: 'الفرن',
    type: 'tool_station',
    materials: { 'stone': 20, 'wood': 5 }, // 20 حجر و 5 خشب
    requiredTool: 'basic_pickaxe', // يحتاج أداة تكسير الأحجار (الفأس) للبناء
    requiredLevel: 1
  },

  // ===================================
  // 🆕 1. تعدين الخامات (Smelting) - 4 خام + 1 خشب = 1 سبيكة
  // ===================================
  'copper_bar': {
    id: 'copper_bar',
    name: 'سبيكة نحاس',
    type: 'bar',
    materials: { 'copper_ore': 4, 'wood': 1 }, // 4 خام + 1 خشب (كوقود)
    requiredTool: 'furnace',
    requiredLevel: 1
  },
  'iron_bar': {
    id: 'iron_bar',
    name: 'سبيكة حديد',
    type: 'bar',
    materials: { 'iron_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 2
  },
  'lead_bar': {
    id: 'lead_bar',
    name: 'سبيكة رصاص',
    type: 'bar',
    materials: { 'lead_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 2
  },
  'bronze_bar': {
    id: 'bronze_bar',
    name: 'سبيكة برونز',
    type: 'bar',
    materials: { 'bronze_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 2
  },
  'steel_bar': {
    id: 'steel_bar',
    name: 'سبيكة صلب',
    type: 'bar',
    materials: { 'steel_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 5
  },
  'dark_iron': {
    id: 'dark_iron',
    name: 'الحديد المظلم',
    type: 'bar',
    materials: { 'dark_iron_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 10
  },
  'silver_bar': {
    id: 'silver_bar',
    name: 'سبيكة فضة',
    type: 'bar',
    materials: { 'silver_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 5
  },
  'gold_bar': {
    id: 'gold_bar',
    name: 'سبيكة ذهب',
    type: 'bar',
    materials: { 'gold_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 5
  },
  'platinum_bar': {
    id: 'platinum_bar',
    name: 'سبيكة بلاتين',
    type: 'bar',
    materials: { 'platinum_ore': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 8
  },
  'hellstone_bar': {
    id: 'hellstone_bar',
    name: 'سبيكة حجر الجحيم',
    type: 'bar',
    materials: { 'hellstone': 4, 'wood': 1 },
    requiredTool: 'furnace',
    requiredLevel: 20
  },
  
  // ===================================
  // 🆕 2. الطبخ (Cooking) - تتطلب الفرن + وقود (Wood)
  // ===================================
  'cooked_meat': {
    id: 'cooked_meat',
    name: 'لحم مطبوخ',
    type: 'food',
    materials: { 'raw_meat': 1, 'wood': 1 }, 
    requiredTool: 'furnace',
    requiredLevel: 1
  },
  'grilled_mushroom': {
    id: 'grilled_mushroom',
    name: 'فطر مشوي',
    type: 'food',
    materials: { 'mushroom': 1, 'wood': 1 }, 
    requiredTool: 'furnace',
    requiredLevel: 1
  },

  // ===================================
  // 3. أسلحة المرحلة الأولى (تتطلب طاولة صناعة)
  // ===================================
  'wooden_bow': {
    id: 'wooden_bow',
    name: 'قوس خشبي',
    type: 'weapon',
    materials: { 'wood': 5, 'copper_bar': 3 }, // تم تغيير لزوم النحاس
    requiredTool: 'crafting_table',
    requiredLevel: 1
  },
  'bronze_dagger': {
    id: 'bronze_dagger',
    name: 'خنجر البرونز',
    type: 'weapon',
    materials: { 'bronze_bar': 5 },
    requiredTool: 'crafting_table',
    requiredLevel: 1
  },
  'copper_shortsword': {
    id: 'copper_shortsword',
    name: 'سيف النحاس',
    type: 'weapon',
    materials: { 'copper_bar': 7 },
    requiredTool: 'crafting_table',
    requiredLevel: 1
  },
  'iron_shortsword': {
    id: 'iron_shortsword',
    name: 'سيف الحديد',
    type: 'weapon',
    materials: { 'iron_bar': 7 },
    requiredTool: 'crafting_table',
    requiredLevel: 2
  },
  'lead_shortsword': {
    id: 'lead_shortsword',
    name: 'سيف الرصاص',
    type: 'weapon',
    materials: { 'lead_bar': 7 },
    requiredTool: 'crafting_table',
    requiredLevel: 2
  },
  'silver_shortsword': {
    id: 'silver_shortsword',
    name: 'سيف الفضة',
    type: 'weapon',
    materials: { 'silver_bar': 7 },
    requiredTool: 'crafting_table',
    requiredLevel: 3
  },
  'gold_shortsword': {
    id: 'gold_shortsword',
    name: 'سيف الذهب',
    type: 'weapon',
    materials: { 'gold_bar': 7 },
    requiredTool: 'crafting_table',
    requiredLevel: 3
  },
  'platinum_shortsword': {
    id: 'platinum_shortsword',
    name: 'سيف البلاتين',
    type: 'weapon',
    materials: { 'platinum_bar': 7 },
    requiredTool: 'crafting_table',
    requiredLevel: 4
  },
  'silver_bow': {
    id: 'silver_bow',
    name: 'قوس الفضة',
    type: 'weapon',
    materials: { 'silver_bar': 8, 'wood': 5 },
    requiredTool: 'crafting_table',
    requiredLevel: 5
  },
  
  // ===================================
  // 4. أسلحة متقدمة
  // ===================================
  'fiery_greatsword': {
    id: 'fiery_greatsword',
    name: 'السيف العظيم الناري',
    type: 'weapon',
    materials: { 'hellstone_bar': 20 },
    requiredTool: 'crafting_table',
    requiredLevel: 20
  },
  'nights_edge': {
    id: 'nights_edge',
    name: 'حد السيف الليلي',
    type: 'weapon',
    materials: { 'muramasa': 1, 'blade_of_grass': 1, 'fiery_greatsword': 1, 'true_excalibur': 1 }, 
    requiredTool: 'crafting_table',
    requiredLevel: 35
  },
  'excalibur': {
    id: 'excalibur',
    name: 'إكسكالابور',
    type: 'weapon',
    materials: { 'hallowed_bar': 12 },
    requiredTool: 'crafting_table',
    requiredLevel: 40
  },
  
  // ===================================
  // 5. الأجنحة (يجب أن يتم صنعها على محطة متقدمة مثل ميثريل/أوريكالكم لكن نستخدم طاولة مؤقتاً)
  // ===================================
  'wyvern_wings': {
    id: 'wyvern_wings',
    name: 'أجنحة الوايفرن',
    type: 'accessory',
    materials: { 'souls_of_flight': 20, 'platinum_bar': 15 },
    requiredTool: 'crafting_table',
    requiredLevel: 45,
    requiredSkill: 5 
  }
};
