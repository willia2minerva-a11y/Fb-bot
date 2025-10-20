// 📦 data/resources.js
// ⚒️ جميع الموارد والخامات والأغراض القابلة للجمع
// محسّنة وموسّعة مستوحاة من Terraria وSolo Leveling

export const resources = {

  // 1. 🌲 موارد الغابات والقرى
  wood: {
    id: 'wood',
    name: 'خشب',
    category: 'forest',
    locations: ['forest', 'village'],
    gatherTime: 5000,
    experience: 5,
    items: [{ itemId: 'wood', min: 1, max: 3, chance: 1 }]
  },
  herb: {
    id: 'herb',
    name: 'عشب طبي',
    category: 'herbal',
    locations: ['forest'],
    gatherTime: 4000,
    experience: 4,
    items: [{ itemId: 'herb', min: 1, max: 2, chance: 1 }]
  },
  vine: {
    id: 'vine',
    name: 'كرمة',
    category: 'forest',
    locations: ['forest', 'underground_jungle'],
    gatherTime: 6000,
    experience: 6,
    items: [{ itemId: 'vine', min: 1, max: 3, chance: 1 }]
  },
  honey: {
    id: 'honey',
    name: 'عسل نحل',
    category: 'herbal',
    locations: ['forest'],
    gatherTime: 8000,
    experience: 10,
    items: [{ itemId: 'honey', min: 1, max: 1, chance: 1 }]
  },

  // 2. ⛏️ موارد التعدين (المعادن والخامات)
  stone: {
    id: 'stone',
    name: 'حجر',
    category: 'mining',
    locations: ['forest', 'desert', 'snow'],
    gatherTime: 7000,
    experience: 7,
    items: [{ itemId: 'stone', min: 1, max: 2, chance: 1 }]
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'خام النحاس',
    category: 'mining',
    locations: ['forest'],
    gatherTime: 8000,
    experience: 10,
    items: [{ itemId: 'copper_ore', min: 1, max: 3, chance: 1 }]
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'خام الحديد',
    category: 'mining',
    locations: ['forest', 'desert'],
    gatherTime: 10000,
    experience: 12,
    items: [{ itemId: 'iron_ore', min: 1, max: 2, chance: 1 }]
  },
  lead_ore: {
    id: 'lead_ore',
    name: 'خام الرصاص',
    category: 'mining',
    locations: ['forest', 'desert'],
    gatherTime: 10500,
    experience: 13,
    items: [{ itemId: 'lead_ore', min: 1, max: 2, chance: 1 }]
  },
  silver_ore: {
    id: 'silver_ore',
    name: 'خام الفضة',
    category: 'mining',
    locations: ['snow', 'ocean'],
    gatherTime: 11000,
    experience: 14,
    items: [{ itemId: 'silver_ore', min: 1, max: 1, chance: 1 }]
  },
  gold_ore: {
    id: 'gold_ore',
    name: 'خام الذهب',
    category: 'mining',
    locations: ['desert', 'underground_jungle'],
    gatherTime: 12000,
    experience: 15,
    items: [{ itemId: 'gold_ore', min: 1, max: 1, chance: 1 }]
  },
  platinum_ore: {
    id: 'platinum_ore',
    name: 'خام البلاتين',
    category: 'mining',
    locations: ['desert', 'sky'],
    gatherTime: 14000,
    experience: 18,
    items: [{ itemId: 'platinum_ore', min: 1, max: 1, chance: 1 }]
  },
  hellstone: {
    id: 'hellstone',
    name: 'حجر الجحيم',
    category: 'mining',
    locations: ['hell'],
    gatherTime: 20000,
    experience: 30,
    items: [{ itemId: 'hellstone', min: 1, max: 1, chance: 1 }]
  },

  // 3. 💎 موارد متقدمة من تيراريا
  mythril_ore: {
    id: 'mythril_ore',
    name: 'خام الميثريل',
    category: 'mining',
    locations: ['underground', 'caverns'],
    gatherTime: 16000,
    experience: 22,
    items: [{ itemId: 'mythril_ore', min: 1, max: 1, chance: 1 }]
  },
  orichalcum_ore: {
    id: 'orichalcum_ore',
    name: 'خام الأوريكالكوم',
    category: 'mining',
    locations: ['underground', 'hell'],
    gatherTime: 18000,
    experience: 25,
    items: [{ itemId: 'orichalcum_ore', min: 1, max: 1, chance: 1 }]
  },
  crimtane_ore: {
    id: 'crimtane_ore',
    name: 'خام الكريمتان',
    category: 'mining',
    locations: ['crimson', 'underground'],
    gatherTime: 17000,
    experience: 23,
    items: [{ itemId: 'crimtane_ore', min: 1, max: 1, chance: 1 }]
  },

  // 4. 🌌 موارد سولو ليفلينغ (روح، مانا، جوهر الظل...)
  mana_crystal: {
    id: 'mana_crystal',
    name: 'بلورة مانا',
    category: 'magic',
    locations: ['dungeon', 'ancient_ruins'],
    gatherTime: 20000,
    experience: 28,
    items: [{ itemId: 'mana_crystal', min: 1, max: 1, chance: 1 }]
  },
  shadow_essence: {
    id: 'shadow_essence',
    name: 'جوهر الظل',
    category: 'magic',
    locations: ['dark_realm', 'dungeon'],
    gatherTime: 22000,
    experience: 35,
    items: [{ itemId: 'shadow_essence', min: 1, max: 1, chance: 1 }]
  },
  beast_fang: {
    id: 'beast_fang',
    name: 'ناب الوحش',
    category: 'beast',
    locations: ['forest', 'cave', 'dungeon'],
    gatherTime: 9000,
    experience: 12,
    items: [{ itemId: 'beast_fang', min: 1, max: 2, chance: 1 }]
  },
  soul_fragment: {
    id: 'soul_fragment',
    name: 'شظية روح',
    category: 'magic',
    locations: ['boss_zone', 'hell'],
    gatherTime: 25000,
    experience: 40,
    items: [{ itemId: 'soul_fragment', min: 1, max: 1, chance: 1 }]
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'قشرة التنين',
    category: 'beast',
    locations: ['sky', 'boss_zone'],
    gatherTime: 26000,
    experience: 50,
    items: [{ itemId: 'dragon_scale', min: 1, max: 1, chance: 1 }]
  },

};    gatherTime: 14000, 
    experience: 18,
    items: [
      { itemId: 'platinum_ore', min: 1, max: 1, chance: 1 }
    ]
  },
  hellstone: {
    id: 'hellstone',
    name: 'حجر الجحيم',
    locations: ['hell'],
    gatherTime: 20000, 
    experience: 30,
    items: [
      { itemId: 'hellstone', min: 1, max: 1, chance: 1 }
    ]
  },
};
