
export const locations = {
  // منطقة التجارة الآمنة
  village: {
    id: 'village',
    name: 'القرية',
    description: 'قرية صغيرة وهادئة، مكان آمن للاسترخاء والتجارة.',
    type: 'safe',
    danger: 0,
    requiredLevel: 1, 
    staminaCost: 5,
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
    staminaCost: 5,
    resources: ['wood', 'mushroom', 'seed', 'bee_honey', 'slime_gel', 'vine', 'honey', 'copper_ore'],
    monsters: ['slime', 'demon_eye', 'wild_boar', 'queen_bee', 'king_slime', 'eye_of_cthulhu', 'zombie', 'turkor_the_ungodly']
  },
  
  // المناطق الجديدة - UPDATED
  desert: {
    id: 'desert',
    name: 'الصحراء',
    description: 'منطقة قاسية، الحرارة فيها عالية، تظهر فيها مخلوقات تتأقلم مع الجفاف.',
    type: 'wild',
    danger: 2,
    requiredLevel: 5,
    staminaCost: 15,
    resources: ['sand', 'cactus', 'stone', 'scorpion_egg', 'gold_ore'],
    monsters: ['slime', 'demon_eye', 'vulture']
  },
  
  underground_jungle: {
    id: 'underground_jungle',
    name: 'الغابة الجوفية',
    description: 'بيئة مظلمة مليئة بالحياة الغريبة، مكان ظهور الوحوش الأسطورية من أعماق الأرض.',
    type: 'dungeon',
    danger: 4,
    requiredLevel: 25,
    staminaCost: 40,
    resources: ['chlorophyte', 'rare_plants', 'glowing_stone', 'vine', 'honey', 'jungle_spores', 'stinger', 'plantera_bulb'],
    monsters: ['queen_bee', 'plantera', 'golem', 'ice_queen']
  },
  
  sky: {
    id: 'sky',
    name: 'السماء',
    description: 'مكان بين الغيوم، حيث تظهر المخلوقات الطائرة والمخلوقات الفضائية.',
    type: 'celestial',
    danger: 3,
    requiredLevel: 15,
    staminaCost: 30,
    requiredItem: 'wyvern_wings',
    resources: ['golden_clouds', 'celestial_crystals', 'flight_tools', 'wyvern_wings', 'souls_of_flight', 'platinum_ore'],
    monsters: ['wyvern', 'martian_saucer', 'the_twins', 'harpy']
  },
  
  ocean: {
    id: 'ocean',
    name: 'المحيط',
    description: 'أعماق المحيط تخفي وحوشًا بحرية قوية؛ الوصول للقاع يمثل تحديًا كبيرًا.',
    type: 'water',
    danger: 3,
    requiredLevel: 10,
    staminaCost: 20,
    resources: ['shells', 'pearl', 'coral', 'raw_fish'],
    monsters: ['duke_fishron']
  },
  
  old_temple: {
    id: 'old_temple',
    name: 'المعبد القديم',
    description: 'بوابة نحو قوى قديمة، يحرسها هيكل عظمي ملعون.',
    type: 'temple',
    danger: 4,
    requiredLevel: 30,
    staminaCost: 45,
    resources: ['sacred_stones', 'statues', 'ancient_symbols', 'bone', 'muramasa'],
    monsters: ['skeletron']
  },
  
  jungle_temple: {
    id: 'jungle_temple',
    name: 'معابد الغابة',
    description: 'موطن الوحش الحجري "غولِم"، آخر أسرار الغابة العميقة.',
    type: 'temple',
    danger: 5,
    requiredLevel: 40,
    staminaCost: 50,
    resources: ['golden_bricks', 'life_energy', 'lihzahrd_power_cell'],
    monsters: ['golem']
  },
  
  hell: {
    id: 'hell',
    name: 'الجحيم',
    description: 'أخطر مناطق العالم، حرارة لا تُحتمل ومخلوقات من الجحيم ذاته.',
    type: 'extreme',
    danger: 5,
    requiredLevel: 50,
    staminaCost: 60,
    resources: ['fire_gems', 'ash', 'hellstone', 'hellstone_bar', 'infernal_ring'],
    monsters: ['wall_of_flesh', 'fire_imp', 'infernal_beast']
  },
  
  snow: {
    id: 'snow',
    name: 'الثلوج',
    description: 'هدوء يغلف الموت الأبيض، حيث تحكم ملكة الجليد.',
    type: 'wild',
    danger: 2,
    requiredLevel: 5,
    staminaCost: 15,
    resources: ['ice', 'snow', 'rare_fish', 'silver_ore'],
    monsters: ['ice_queen']
  },
  
  lunar_temple: {
    id: 'lunar_temple',
    name: 'المعبد القمري',
    description: 'مكان يجتمع فيه عبدة القمر لإطلاق قوى الظلال.',
    type: 'temple',
    danger: 5,
    requiredLevel: 60,
    staminaCost: 70,
    resources: ['lunar_crystals', 'celestial_energy', 'moon_dust', 'nebula_fragments'],
    monsters: ['cultists', 'solar_eclipse_mob', 'moon_lord']
  },
  
  magic_castle: {
    id: 'magic_castle',
    name: 'القلعة السحرية',
    description: 'قلعة الظلال، موطن الملك الذي يسيطر على الموتى.',
    type: 'dungeon',
    danger: 5,
    requiredLevel: 65,
    staminaCost: 75,
    resources: ['spell_books', 'magic_crystals', 'shadow_monarch_orb'],
    monsters: ['shadow_monarch']
  },
  
  dark_castle: {
    id: 'dark_castle',
    name: 'القلاع المظلمة',
    description: 'مركز القوى المظلمة، حيث تُصنع الجيوش الشيطانية.',
    type: 'dungeon',
    danger: 5,
    requiredLevel: 70,
    staminaCost: 80,
    resources: ['trapped_souls', 'black_runes', 'dark_lord_staff'],
    monsters: ['dark_lord', 'death_knight']
  },
  
  ruler_castle: {
    id: 'ruler_castle',
    name: 'قلعة الحاكم',
    description: 'قلعة الحاكم الأعلى، حيث تتلاقى نهاية جميع الصراعات.',
    type: 'dungeon',
    danger: 5,
    requiredLevel: 75,
    staminaCost: 90,
    resources: ['royal_treasures', 'throne_shards', 'monarch_fist', 'destruction_ring'],
    monsters: ['monarch_of_destruction']
  },

  // ===================================
  // البوابات الجديدة - UPDATED WITH ARABIC NAMES
  // ===================================
  
  e_d_gates: {
    id: 'e_d_gates',
    name: 'بوابة المبتدئين',
    description: 'بوابة للمستوى المبتدئ، مناسبة للاعبين الجدد.',
    type: 'gate',
    danger: 2,
    requiredLevel: 3,
    staminaCost: 10,
    resources: ['spider_web', 'spider_fang'],
    monsters: ['low_level_goblin', 'giant_spiders', 'wild_boar']
  },
  
  b_a_gates: {
    id: 'b_a_gates',
    name: 'بوابة المحاربين',
    description: 'بوابة للمستوى المتوسط، تتطلب مهارات أفضل.',
    type: 'gate',
    danger: 4,
    requiredLevel: 12,
    staminaCost: 25,
    resources: ['iron_ore', 'copper_ore'],
    monsters: ['goblin_warrior']
  },
  
  a_s_gates: {
    id: 'a_s_gates',
    name: 'بوابة الأبطال',
    description: 'بوابة للمستوى المتقدم، مليئة بالتحديات.',
    type: 'gate',
    danger: 6,
    requiredLevel: 25,
    staminaCost: 35,
    resources: ['dark_crystal'],
    monsters: ['ghoul']
  },
  
  s_rank_gates: {
    id: 's_rank_gates',
    name: 'بوابة الأساطير',
    description: 'بوابة للنخبة، فقط الأقوى يمكنهم النجاة هنا.',
    type: 'gate',
    danger: 9,
    requiredLevel: 50,
    staminaCost: 60,
    resources: ['mythical_fragment', 'soul_shard'],
    monsters: ['phantom_knight', 'fire_imp', 'cerberus', 'dragon_wyrm', 'kamish', 'black_dragon', 'dark_lord']
  },
  
  double_dungeon: {
    id: 'double_dungeon',
    name: 'البوابة المزدوجة',
    description: 'زنزانة مزدوجة صعبة، اختبار حقيقي للقوة.',
    type: 'gate',
    danger: 10,
    requiredLevel: 65,
    staminaCost: 70,
    resources: ['dragon_kings_horn', 'wyrm_scale'],
    monsters: ['dragon_wyrm', 'cerberus', 'dragon_king']
  },
  
  ultimate_dungeon: {
    id: 'ultimate_dungeon',
    name: 'البوابة القصوى',
    description: 'البوابة النهائية، أقصى تحدٍ في اللعبة.',
    type: 'gate',
    danger: 12,
    requiredLevel: 80,
    staminaCost: 85,
    resources: ['abyssal_blade_resource', 'dark_abyss_core'],
    monsters: ['abyssal_lord']
  },
  
  a_b_gates: {
    id: 'a_b_gates',
    name: 'بوابة العبور',
    description: 'بوابة متوسطة المستوى، جسر بين المستويات.',
    type: 'gate',
    danger: 5,
    requiredLevel: 20,
    staminaCost: 30,
    resources: ['dark_essence'],
    monsters: ['dark_soldier']
  },
  
  c_a_gates: {
    id: 'c_a_gates',
    name: 'بوابة التحدي',
    description: 'بوابة للانتقال من المستوى C إلى A.',
    type: 'gate',
    danger: 4,
    requiredLevel: 18,
    staminaCost: 25,
    resources: ['frost_essence'],
    monsters: ['ice_demon']
  },

  // ===================================
  // المناطق الخاصة الجديدة - UPDATED WITH NON-DIVINE NAMES
  // ===================================
  
  mythical_dungeon: {
    id: 'mythical_dungeon',
    name: 'الزنزانة الأسطورية',
    description: 'مكان للقوى الأسطورية، مليء بالطاقة العظيمة.',
    type: 'special',
    danger: 18,
    requiredLevel: 95,
    staminaCost: 100,
    resources: ['mythical_fragment', 'legendary_steel', 'supreme_essence'],
    monsters: ['ancient_guardian']
  },
  
  celestial_dungeon: {
    id: 'celestial_dungeon',
    name: 'الزنزانة السماوية',
    description: 'مكان سماوي نقي، مصدر القوة العليا.',
    type: 'special',
    danger: 16,
    requiredLevel: 88,
    staminaCost: 90,
    resources: ['sacred_steel'],
    monsters: []
  },
  
  mythical_realm: {
    id: 'mythical_realm',
    name: 'عالم الأساطير',
    description: 'عالم القوى العظيمة، حيث تتجلى القوى الأسطورية.',
    type: 'special',
    danger: 19,
    requiredLevel: 98,
    staminaCost: 110,
    resources: ['celestial_fragment'],
    monsters: ['ancient_guardian']
  },
  
  final_stage: {
    id: 'final_stage',
    name: 'المرحلة النهائية',
    description: 'المرحلة الأخيرة في الرحلة، اختبار القوة النهائي.',
    type: 'special',
    danger: 25,
    requiredLevel: 99,
    staminaCost: 120,
    resources: ['soul_shard'],
    monsters: ['soulfire_dragon']
  },
  
  hallowed: {
    id: 'hallowed',
    name: 'الأراضي المقدسة',
    description: 'أراضي مقدسة ونقية، مليئة بالطاقة المباركة.',
    type: 'special',
    danger: 8,
    requiredLevel: 55,
    staminaCost: 65,
    resources: ['hallowed_bar'],
    monsters: ['empress_of_light']
  },
  
  order_castle: {
    id: 'order_castle',
    name: 'قلعة النظام',
    description: 'قلعة تحميها قوى النظام، معقل العدالة.',
    type: 'dungeon',
    danger: 12,
    requiredLevel: 75,
    staminaCost: 80,
    resources: ['igris_sword', 'igris_armor'],
    monsters: ['igris_the_bloodred']
  }
};
