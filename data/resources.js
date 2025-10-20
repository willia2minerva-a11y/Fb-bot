// 📁 data/resources.js

export const resources = {
  wood: {
    id: 'wood',
    name: 'خشب',
    locations: ['forest', 'plains'],
    gatherTime: 4000,
    experience: 5,
    items: [
      { itemId: 'wood', min: 1, max: 3, chance: 1 }
    ]
  },

  stone: {
    id: 'stone',
    name: 'حجر',
    locations: ['mountains', 'caves'],
    gatherTime: 5000,
    experience: 6,
    items: [
      { itemId: 'stone', min: 1, max: 2, chance: 1 }
    ]
  },

  iron_ore: {
    id: 'iron_ore',
    name: 'خام الحديد',
    locations: ['underground', 'mountains'],
    gatherTime: 8000,
    experience: 10,
    items: [
      { itemId: 'iron_ore', min: 1, max: 1, chance: 1 }
    ]
  },

  silver_ore: {
    id: 'silver_ore',
    name: 'خام الفضة',
    locations: ['underground', 'mountains'],
    gatherTime: 10000,
    experience: 12,
    items: [
      { itemId: 'silver_ore', min: 1, max: 1, chance: 1 }
    ]
  },

  gold_ore: {
    id: 'gold_ore',
    name: 'خام الذهب',
    locations: ['underground', 'mountains'],
    gatherTime: 12000,
    experience: 15,
    items: [
      { itemId: 'gold_ore', min: 1, max: 1, chance: 1 }
    ]
  },

  platinum_ore: {
    id: 'platinum_ore',
    name: 'خام البلاتين',
    locations: ['underground', 'mountains'],
    gatherTime: 14000,
    experience: 18,
    items: [
      { itemId: 'platinum_ore', min: 1, max: 1, chance: 1 }
    ]
  },

  demonite_ore: {
    id: 'demonite_ore',
    name: 'خام الشيطان',
    locations: ['corruption', 'underground'],
    gatherTime: 16000,
    experience: 20,
    items: [
      { itemId: 'demonite_ore', min: 1, max: 1, chance: 1 }
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

  cursed_fragment: {
    id: 'cursed_fragment',
    name: 'شظية ملعونة',
    locations: ['underground_jungle', 'hell', 'dungeon'],
    gatherTime: 25000,
    experience: 45,
    items: [
      { itemId: 'cursed_fragment', min: 1, max: 1, chance: 0.7 }
    ]
  }
};
