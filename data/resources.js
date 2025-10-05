export const resources = {
  // 1. موارد الغابات والقرية
  wood: {
    id: 'wood',
    name: 'خشب',
    locations: ['forest', 'village'],
    gatherTime: 5000, 
    experience: 5,
    items: [
      { itemId: 'wood', min: 1, max: 3, chance: 1 }
    ]
  },
  herb: {
    id: 'herb',
    name: 'عشب طبي',
    locations: ['forest'],
    gatherTime: 4000, 
    experience: 4,
    items: [
      { itemId: 'herb', min: 1, max: 2, chance: 1 }
    ]
  },
  vine: {
    id: 'vine',
    name: 'الكرمة',
    locations: ['forest', 'underground_jungle'],
    gatherTime: 6000, 
    experience: 6,
    items: [
      { itemId: 'vine', min: 1, max: 3, chance: 1 }
    ]
  },
  honey: {
    id: 'honey',
    name: 'عسل النحل',
    locations: ['forest'],
    gatherTime: 8000, 
    experience: 10,
    items: [
      { itemId: 'honey', min: 1, max: 1, chance: 1 }
    ]
  },

  // 2. موارد التعدين (المعادن/الخامات)
  stone: {
    id: 'stone',
    name: 'حجر',
    locations: ['forest', 'desert', 'snow'],
    gatherTime: 7000, 
    experience: 7,
    items: [
      { itemId: 'stone', min: 1, max: 2, chance: 1 }
    ]
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'خام النحاس',
    locations: ['forest'],
    gatherTime: 8000, 
    experience: 10,
    items: [
      { itemId: 'copper_ore', min: 1, max: 3, chance: 1 }
    ]
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'خام الحديد',
    locations: ['forest', 'desert'],
    gatherTime: 10000, 
    experience: 12,
    items: [
      { itemId: 'iron_ore', min: 1, max: 2, chance: 1 }
    ]
  },
  lead_ore: {
    id: 'lead_ore',
    name: 'خام الرصاص',
    locations: ['forest', 'desert'],
    gatherTime: 10500, 
    experience: 13,
    items: [
      { itemId: 'lead_ore', min: 1, max: 2, chance: 1 }
    ]
  },
  silver_ore: {
    id: 'silver_ore',
    name: 'خام الفضة',
    locations: ['snow', 'ocean'],
    gatherTime: 11000, 
    experience: 14,
    items: [
      { itemId: 'silver_ore', min: 1, max: 1, chance: 1 }
    ]
  },
  gold_ore: {
    id: 'gold_ore',
    name: 'خام الذهب',
    locations: ['desert', 'underground_jungle'],
    gatherTime: 12000, 
    experience: 15,
    items: [
      { itemId: 'gold_ore', min: 1, max: 1, chance: 1 }
    ]
  },
  platinum_ore: {
    id: 'platinum_ore',
    name: 'خام البلاتين',
    locations: ['desert', 'sky'],
    gatherTime: 14000, 
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
