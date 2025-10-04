export const resources = {
  wood: {
    id: 'wood',
    name: 'خشب',
    locations: ['forest'],
    gatherTime: 5000, // 5 ثواني
    experience: 5,
    items: [
      { itemId: 'wood', min: 1, max: 3, chance: 1 }
    ]
  },
  stone: {
    id: 'stone',
    name: 'حجر',
    locations: ['forest'],
    gatherTime: 7000, // 7 ثواني
    experience: 7,
    items: [
      { itemId: 'stone', min: 1, max: 2, chance: 1 }
    ]
  },
  herb: {
    id: 'herb',
    name: 'عشب طبي',
    locations: ['forest'],
    gatherTime: 4000, // 4 ثواني
    experience: 4,
    items: [
      { itemId: 'herb', min: 1, max: 2, chance: 1 }
    ]
  }
};
