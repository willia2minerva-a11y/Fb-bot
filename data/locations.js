export const locations = {
  // منطقة التجارة الآمنة
  village: {
    id: 'village',
    name: 'القرية',
    description: 'قرية صغيرة وهادئة، مكان آمن للاسترخاء والتجارة.',
    type: 'safe',
    danger: 0,
    requiredLevel: 1, 
    resources: [],
    monsters: []
  },
  
  // المنطقة الافتراضية للبداية
  forest: {
    id: 'forest',
    name: 'الغابات',
    description: 'أول منطقة يبدأ فيها اللاعب، مليئة بالكائنات الضعيفة وبعض الزعماء الأوائل، تمثل عالم الطبيعة الأولى في اللعبة.',
    type: 'wild',
    danger: 1,
    requiredLevel: 0, 
    resources: ['wood', 'mushroom', 'seed', 'bee_honey'],
    monsters: ['slime', 'demon_eye', 'wild_boar', 'queen_bee', 'king_slime', 'eye_of_cthulhu']
  },
  
  // المناطق الجديدة
  desert: {
    id: 'desert',
    name: 'الصحراء',
    description: 'منطقة قاسية، الحرارة فيها عالية، تظهر فيها مخلوقات تتأقلم مع الجفاف.',
    type: 'wild',
    danger: 2,
    requiredLevel: 5,
    resources: ['sand', 'cactus', 'stone', 'scorpion_egg'],
    monsters: ['slime', 'demon_eye']
  },
  underground_jungle: {
    id: 'underground_jungle',
    name: 'الغابة الجوفية',
    description: 'بيئة مظلمة مليئة بالحياة الغريبة، مكان ظهور الوحوش الأسطورية من أعماق الأرض.',
    type: 'dungeon',
    danger: 4,
    requiredLevel: 25,
    resources: ['chlorophyte', 'rare_plants', 'glowing_stone'],
    monsters: ['queen_bee', 'plantera', 'golem', 'ice_queen']
  },
  sky: {
    id: 'sky',
    name: 'السماء',
    description: 'مكان بين الغيوم، حيث تظهر المخلوقات الطائرة والمخلوقات الفضائية.',
    type: 'celestial',
    danger: 3,
    requiredLevel: 15,
    resources: ['golden_clouds', 'celestial_crystals', 'flight_tools'],
    monsters: ['wyvern', 'martian_saucer', 'the_twins']
  },
  ocean: {
    id: 'ocean',
    name: 'المحيط',
    description: 'أعماق المحيط تخفي وحوشًا بحرية قوية؛ الوصول للقاع يمثل تحديًا كبيرًا.',
    type: 'water',
    danger: 3,
    requiredLevel: 10,
    resources: ['shells', 'pearl', 'coral'],
    monsters: ['duke_fishron']
  },
  old_temple: {
    id: 'old_temple',
    name: 'المعبد القديم',
    description: 'بوابة نحو قوى قديمة، يحرسها هيكل عظمي ملعون.',
    type: 'temple',
    danger: 4,
    requiredLevel: 30,
    resources: ['sacred_stones', 'statues', 'ancient_symbols'],
    monsters: ['skeletron']
  },
  jungle_temple: {
    id: 'jungle_temple',
    name: 'معابد الغابة',
    description: 'موطن الوحش الحجري "غولِم"، آخر أسرار الغابة العميقة.',
    type: 'temple',
    danger: 5,
    requiredLevel: 40,
    resources: ['golden_bricks', 'life_energy'],
    monsters: ['golem']
  },
  hell: {
    id: 'hell',
    name: 'الجحيم',
    description: 'أخطر مناطق العالم، حرارة لا تُحتمل ومخلوقات من الجحيم ذاته.',
    type: 'extreme',
    danger: 5,
    requiredLevel: 50,
    resources: ['fire_gems', 'ash', 'hellstone'],
    monsters: ['wall_of_flesh', 'fire_imp', 'infernal_beast']
  },
  snow: {
    id: 'snow',
    name: 'الثلوج',
    description: 'هدوء يغلف الموت الأبيض، حيث تحكم ملكة الجليد.',
    type: 'wild',
    danger: 2,
    requiredLevel: 5,
    resources: ['ice', 'snow', 'rare_fish'],
    monsters: ['ice_queen']
  },
  lunar_temple: {
    id: 'lunar_temple',
    name: 'المعبد القمري',
    description: 'مكان يجتمع فيه عبدة القمر لإطلاق قوى الظلال.',
    type: 'temple',
    danger: 5,
    requiredLevel: 60,
    resources: ['lunar_crystals', 'celestial_energy'],
    monsters: ['cultists', 'solar_eclipse']
  },
  magic_castle: {
    id: 'magic_castle',
    name: 'القلعة السحرية',
    description: 'قلعة الظلال، موطن الملك الذي يسيطر على الموتى.',
    type: 'dungeon',
    danger: 5,
    requiredLevel: 65,
    resources: ['spell_books', 'magic_crystals'],
    monsters: ['shadow_monarch']
  },
  dark_castle: {
    id: 'dark_castle',
    name: 'القلاع المظلمة',
    description: 'مركز القوى المظلمة، حيث تُصنع الجيوش الشيطانية.',
    type: 'dungeon',
    danger: 5,
    requiredLevel: 70,
    resources: ['trapped_souls', 'black_runes'],
    monsters: ['dark_lord']
  },
  ruler_castle: {
    id: 'ruler_castle',
    name: 'قلعة الحاكم',
    description: 'قلعة الحاكم الأعلى، حيث تتلاقى نهاية جميع الصراعات.',
    type: 'dungeon',
    danger: 5,
    requiredLevel: 75,
    resources: ['royal_treasures', 'throne_shards'],
    monsters: ['monarch_of_destruction']
  }
};
