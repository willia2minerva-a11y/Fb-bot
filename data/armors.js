export const armors = {
  // تنسيق: defense, critResist, part ('helmet','chestplate','leggings'), level, element
  // Common tier armors
  leather_helmet: {
    id: 'leather_helmet',
    name: 'خوذة جلدية',
    type: 'armor',
    part: 'helmet',
    description: 'خوذة خفيفة من الجلد توفر حماية أساسية.',
    rarity: 'common',
    defense: 6,
    critResist: 1,
    level: 2,
    element: 'neutral',
    materials: [{ id: 'wood', count: 3 }]
  },
  leather_chestplate: {
    id: 'leather_chestplate',
    name: 'صدرية جلدية',
    type: 'armor',
    part: 'chestplate',
    description: 'صدرية جلدية مرنة.',
    rarity: 'common',
    defense: 12,
    critResist: 1,
    level: 3,
    element: 'neutral',
    materials: [{ id: 'leather', count: 8 }]
  },
  leather_leggings: {
    id: 'leather_leggings',
    name: 'سروال جلدي',
    type: 'armor',
    part: 'leggings',
    description: 'سروال يوفر حماية بسيطة.',
    rarity: 'common',
    defense: 8,
    critResist: 0,
    level: 3,
    element: 'neutral',
    materials: [{ id: 'leather', count: 6 }]
  },

  // Uncommon armors
  iron_helmet: {
    id: 'iron_helmet',
    name: 'خوذة حديدية',
    type: 'armor',
    part: 'helmet',
    description: 'خوذة حديدية متينة.',
    rarity: 'uncommon',
    defense: 20,
    critResist: 2,
    level: 12,
    element: 'neutral',
    materials: [{ id: 'iron_bar', count: 6 }]
  },
  iron_chestplate: {
    id: 'iron_chestplate',
    name: 'صدرية حديد',
    type: 'armor',
    part: 'chestplate',
    description: 'درع صدر قوي.',
    rarity: 'uncommon',
    defense: 40,
    critResist: 3,
    level: 14,
    element: 'neutral',
    materials: [{ id: 'iron_bar', count: 12 }]
  },
  iron_leggings: {
    id: 'iron_leggings',
    name: 'سروال حديد',
    type: 'armor',
    part: 'leggings',
    description: 'يحمي الساقين بشكل جيد.',
    rarity: 'uncommon',
    defense: 30,
    critResist: 2,
    level: 13,
    element: 'neutral',
    materials: [{ id: 'iron_bar', count: 9 }]
  },

  // Rare armors
  silver_helmet: {
    id: 'silver_helmet',
    name: 'خوذة الفضة',
    type: 'armor',
    part: 'helmet',
    description: 'خوذة متقنة من الفضة تمنح بعض المقاومة للشر.',
    rarity: 'rare',
    defense: 55,
    critResist: 5,
    level: 22,
    element: 'holy',
    materials: [{ id: 'silver_bar', count: 8 }]
  },
  silver_chestplate: {
    id: 'silver_chestplate',
    name: 'صدرية الفضة',
    type: 'armor',
    part: 'chestplate',
    description: 'صدرية تمنح حماية جيدة ومزايا صغيرة ضد العناصر.',
    rarity: 'rare',
    defense: 90,
    critResist: 6,
    level: 24,
    element: 'holy',
    materials: [{ id: 'silver_bar', count: 14 }]
  },
  silver_leggings: {
    id: 'silver_leggings',
    name: 'سروال الفضة',
    type: 'armor',
    part: 'leggings',
    description: 'سروال فخم وواقٍ.',
    rarity: 'rare',
    defense: 70,
    critResist: 5,
    level: 23,
    element: 'holy',
    materials: [{ id: 'silver_bar', count: 10 }]
  },

  // Epic armors
  dark_iron_helmet: {
    id: 'dark_iron_helmet',
    name: 'خوذة الحديد المظلم',
    type: 'armor',
    part: 'helmet',
    description: 'خوذة مزخرفة بقوة الظلام.',
    rarity: 'epic',
    defense: 140,
    critResist: 12,
    level: 46,
    element: 'dark',
    materials: [{ id: 'dark_iron', count: 8 }]
  },
  dark_iron_chestplate: {
    id: 'dark_iron_chestplate',
    name: 'صدرية الحديد المظلم',
    type: 'armor',
    part: 'chestplate',
    description: 'صدرية قوية تمنح مقاومة كبيرة.',
    rarity: 'epic',
    defense: 260,
    critResist: 14,
    level: 48,
    element: 'dark',
    materials: [{ id: 'dark_iron', count: 18 }]
  },
  dark_iron_leggings: {
    id: 'dark_iron_leggings',
    name: 'سروال الحديد المظلم',
    type: 'armor',
    part: 'leggings',
    description: 'يحميك من هجمات الظلام والفيزيائية.',
    rarity: 'epic',
    defense: 190,
    critResist: 12,
    level: 47,
    element: 'dark',
    materials: [{ id: 'dark_iron', count: 14 }]
  },

  // Legendary / Mythical armors
  hallowed_helmet: {
    id: 'hallowed_helmet',
    name: 'خوذة مقدسة',
    type: 'armor',
    part: 'helmet',
    description: 'خوذة من سبائك مقدسة، تقاوم الشر.',
    rarity: 'legendary',
    defense: 380,
    critResist: 22,
    level: 88,
    element: 'holy',
    materials: [{ id: 'hallowed_bar', count: 10 }]
  },
  hallowed_chestplate: {
    id: 'hallowed_chestplate',
    name: 'صدرية مقدسة',
    type: 'armor',
    part: 'chestplate',
    description: 'درع مقدس يمنح قوة دفاعية ضخمة.',
    rarity: 'legendary',
    defense: 720,
    critResist: 25,
    level: 90,
    element: 'holy',
    materials: [{ id: 'hallowed_bar', count: 30 }]
  },
  hallowed_leggings: {
    id: 'hallowed_leggings',
    name: 'سروال مقدس',
    type: 'armor',
    part: 'leggings',
    description: 'سروال يمنح راحة وحماية في المعارك الكبرى.',
    rarity: 'legendary',
    defense: 520,
    critResist: 22,
    level: 89,
    element: 'holy',
    materials: [{ id: 'hallowed_bar', count: 20 }]
  },

  divine_helmet: {
    id: 'divine_helmet',
    name: 'خوذة إلهية',
    type: 'armor',
    part: 'helmet',
    description: 'خوذة مصنوعة من مواد إلهية.',
    rarity: 'mythical',
    defense: 1200,
    critResist: 40,
    level: 100,
    element: 'divine',
    materials: [{ id: 'divine_fragment', count: 3 }, { id: 'sacred_steel', count: 5 }]
  },
  divine_chestplate: {
    id: 'divine_chestplate',
    name: 'صدرية إلهية',
    type: 'armor',
    part: 'chestplate',
    description: 'أقوى درع يحمي حامل الإله.',
    rarity: 'mythical',
    defense: 2400,
    critResist: 45,
    level: 100,
    element: 'divine',
    materials: [{ id: 'divine_fragment', count: 8 }, { id: 'sacred_steel', count: 15 }]
  },
  divine_leggings: {
    id: 'divine_leggings',
    name: 'سروال إلهي',
    type: 'armor',
    part: 'leggings',
    description: 'يحمي الساقين بقوة إلهية.',
    rarity: 'mythical',
    defense: 1600,
    critResist: 42,
    level: 100,
    element: 'divine',
    materials: [{ id: 'divine_fragment', count: 5 }, { id: 'sacred_steel', count: 10 }]
  }
};
