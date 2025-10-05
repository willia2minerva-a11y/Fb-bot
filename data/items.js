export const items = {
  // ===================================
  // مواد أساسية وخامات مستخرجة (تستخدم في الصناعة)
  // ===================================
  wood: { id: 'wood', name: 'خشب', type: 'resource', description: 'خشب عادي يمكن استخدامه في الصناعة.', rarity: 'common' },
  stone: { id: 'stone', name: 'حجر', type: 'resource', description: 'حجر صلب يمكن استخدامه في البناء.', rarity: 'common' },
  herb: { id: 'herb', name: 'عشب طبي', type: 'resource', description: 'عشب يستخدم في صناعة الأدوية.', rarity: 'common' },
  vine: { id: 'vine', name: 'الكرمة', type: 'resource', description: 'يُجمع من الكروم في الغابات.', rarity: 'uncommon' },
  honey: { id: 'honey', name: 'عسل النحل', type: 'resource', description: 'يُجمع من خلايا النحل، يستخدم للتعافي.', rarity: 'uncommon' },
  
  // الخامات
  copper_ore: { id: 'copper_ore', name: 'خام النحاس', type: 'ore', description: 'أبسط أنواع الخامات.', rarity: 'common' },
  iron_ore: { id: 'iron_ore', name: 'خام الحديد', type: 'ore', description: 'يستخدم لصناعة الأدوات الحديدية الأساسية.', rarity: 'common' },
  lead_ore: { id: 'lead_ore', name: 'خام الرصاص', type: 'ore', description: 'بديل للحديد في الصناعة.', rarity: 'common' },
  silver_ore: { id: 'silver_ore', name: 'خام الفضة', type: 'ore', description: 'خام ذو جودة متوسطة.', rarity: 'uncommon' },
  gold_ore: { id: 'gold_ore', name: 'خام الذهب', type: 'ore', description: 'يستخدم لصناعة الأدوات الذهبية.', rarity: 'uncommon' },
  platinum_ore: { id: 'platinum_ore', name: 'خام البلاتين', type: 'ore', description: 'بديل للذهب، أكثر قوة.', rarity: 'rare' },
  hellstone: { id: 'hellstone', name: 'حجر الجحيم', type: 'ore', description: 'معدن محترق من الجحيم.', rarity: 'rare' },
  
  // السبائك (Bars)
  copper_bar: { id: 'copper_bar', name: 'سبيكة نحاس', type: 'bar', description: 'سبيكة معدنية أساسية.' },
  iron_bar: { id: 'iron_bar', name: 'سبيكة حديد', type: 'bar', description: 'سبيكة حديدية صلبة.' },
  lead_bar: { id: 'lead_bar', name: 'سبيكة رصاص', type: 'bar', description: 'سبيكة تستخدم لصناعة الأسلحة المتوسطة.' },
  silver_bar: { id: 'silver_bar', name: 'سبيكة فضة', type: 'bar', description: 'سبيكة تستخدم لأسلحة أفضل.' },
  gold_bar: { id: 'gold_bar', name: 'سبيكة ذهب', type: 'bar', description: 'سبيكة لامعة وقيمة.' },
  platinum_bar: { id: 'platinum_bar', name: 'سبيكة بلاتين', type: 'bar', description: 'سبيكة ذات جودة عالية.' },
  hellstone_bar: { id: 'hellstone_bar', name: 'سبيكة حجر الجحيم', type: 'bar', description: 'سبيكة تنبعث منها حرارة.' },
  hallowed_bar: { id: 'hallowed_bar', name: 'سبيكة مقدسة', type: 'bar', description: 'سبيكة إلهية، تُحصل بعد هزيمة التوأم.' },
  bronze_bar: { id: 'bronze_bar', name: 'سبيكة برونز', type: 'bar', description: 'سبيكة من النحاس والقصدير.' },
  steel_bar: { id: 'steel_bar', name: 'سبيكة صلب', type: 'bar', description: 'معدن أقوى من الحديد.' },
  dark_iron: { id: 'dark_iron', name: 'الحديد المظلم', type: 'bar', description: 'معدن نادر من المناطق المظلمة.' },

  // ===================================
  // الأسلحة الضعيفة إلى المتوسطة (Crafted & Found)
  // ===================================
  basic_pickaxe: { id: 'basic_pickaxe', name: 'فأس أساسي', type: 'tool', description: 'فأس بسيط لجمع الموارد.', efficiency: 1, rarity: 'common' },
  wooden_bow: { id: 'wooden_bow', name: 'قوس خشبي', type: 'weapon', description: 'قوس بسيط للرماة المبتدئين.', damage: 20, rarity: 'common', materials: [{ id: 'wood', count: 5 }, { id: 'iron_bar', count: 3 }] },
  bronze_dagger: { id: 'bronze_dagger', name: 'خنجر البرونز', type: 'weapon', description: 'خنجر حاد من البرونز.', damage: 15, rarity: 'common', materials: [{ id: 'bronze_bar', count: 5 }] },
  copper_shortsword: { id: 'copper_shortsword', name: 'سيف النحاس', type: 'weapon', description: 'سيف نحاسي أساسي.', damage: 6, rarity: 'common', materials: [{ id: 'copper_bar', count: 7 }] },
  iron_shortsword: { id: 'iron_shortsword', name: 'سيف الحديد', type: 'weapon', description: 'سيف حديدي بسيط.', damage: 7, rarity: 'common', materials: [{ id: 'iron_bar', count: 7 }] },
  lead_shortsword: { id: 'lead_shortsword', name: 'سيف الرصاص', type: 'weapon', description: 'سيف ثقيل نسبياً.', damage: 8, rarity: 'common', materials: [{ id: 'lead_bar', count: 7 }] },
  silver_shortsword: { id: 'silver_shortsword', name: 'سيف الفضة', type: 'weapon', description: 'سيف فضي جيد.', damage: 9, rarity: 'uncommon', materials: [{ id: 'silver_bar', count: 7 }] },
  gold_shortsword: { id: 'gold_shortsword', name: 'سيف الذهب', type: 'weapon', description: 'سيف ذهبي، أكثر قيمة من القوة.', damage: 10, rarity: 'uncommon', materials: [{ id: 'gold_bar', count: 7 }] },
  platinum_shortsword: { id: 'platinum_shortsword', name: 'سيف البلاتين', type: 'weapon', description: 'سيف عالي الجودة للمبتدئين.', damage: 11, rarity: 'uncommon', materials: [{ id: 'platinum_bar', count: 7 }] },
  iron_sword: { id: 'iron_sword', name: 'سيف الحديد', type: 'weapon', description: 'سيف حديدي قياسي.', damage: 25, rarity: 'uncommon', materials: [{ id: 'iron_bar', count: 8 }] },
  steel_mace: { id: 'steel_mace', name: 'مطرقة الصلب', type: 'weapon', description: 'مطرقة ثقيلة من الصلب.', damage: 35, rarity: 'uncommon', materials: [{ id: 'steel_bar', count: 10 }] },
  silver_sword: { id: 'silver_sword', name: 'سيف الفضة', type: 'weapon', description: 'سيف فضي حاد.', damage: 40, rarity: 'rare', materials: [{ id: 'silver_bar', count: 7 }] },
  silver_bow: { id: 'silver_bow', name: 'قوس الفضة', type: 'weapon', description: 'قوس مصنوع من الفضة.', damage: 45, rarity: 'rare', materials: [{ id: 'silver_bar', count: 8 }, { id: 'wood', count: 5 }] },
  fiery_greatsword: { id: 'fiery_greatsword', name: 'السيف العظيم الناري', type: 'weapon', description: 'سيف عملاق مشتعل.', damage: 48, rarity: 'rare', materials: [{ id: 'hellstone_bar', count: 20 }] },
  enchanted_sword: { id: 'enchanted_sword', name: 'السيف المسحور', type: 'weapon', description: 'سيف قديم يحتوي على تأثيرات سحرية.', damage: 50, rarity: 'rare' },
  muramasa: { id: 'muramasa', name: 'موراماسا', type: 'weapon', description: 'سيف ياباني أسطوري، سريع جداً.', damage: 45, rarity: 'rare' },

  // ===================================
  // الأسلحة المتوسطة (Boss Drops & Crafting)
  // ===================================
  the_bee_keeper: { id: 'the_bee_keeper', name: 'حارس النحل', type: 'weapon', description: 'سيف يطلق نحل صغير عند الهجوم.', damage: 40, rarity: 'rare' },
  poisonous_dagger: { id: 'poisonous_dagger', name: 'خنجر السم', type: 'weapon', description: 'خنجر يسبب ضرر سمي.', damage: 50, rarity: 'rare' },
  ice_blade: { id: 'ice_blade', name: 'سيف الجليد', type: 'weapon', description: 'يطلق نوبات ثلجية.', damage: 55, rarity: 'rare' },
  flame_staff: { id: 'flame_staff', name: 'عصا اللهب', type: 'weapon', description: 'عصا سحرية تطلق كرات نار.', damage: 60, rarity: 'rare' },
  trident: { id: 'trident', name: 'الرمح (Trident)', type: 'weapon', description: 'رمح ثلاثي الرؤوس يسقطه فيشرون.', damage: 60, rarity: 'epic' },
  dark_spear: { id: 'dark_spear', name: 'رمح الظلام', type: 'weapon', description: 'رمح يلفه الظلام.', damage: 70, rarity: 'epic' },
  vampire_knives: { id: 'vampire_knives', name: 'خناجر مصاصة الدماء', type: 'weapon', description: 'تعيد جزء من الصحة عند الهجوم.', damage: 75, rarity: 'epic' },
  excalibur: { id: 'excalibur', name: 'إكسكالابور', type: 'weapon', description: 'السيف المقدس، قوي جداً.', damage: 50, rarity: 'epic', materials: [{ id: 'hallowed_bar', count: 12 }] },
  nights_edge: { 
    id: 'nights_edge', 
    name: "حد السيف الليلي", 
    type: 'weapon', 
    description: 'دمج أربعة سيوف قوية.', 
    damage: 47, 
    rarity: 'epic', 
    materials: [
      { id: 'muramasa', count: 1 }, 
      // نحتاج تعريف الأسلحة المكونة الأخرى (True Excalibur, Blade of Grass, إلخ.)
      // مؤقتاً:
      { id: 'blade_of_grass', count: 1 }, 
      { id: 'fiery_greatsword', count: 1 } 
    ] 
  },

  // ===================================
  // الأسلحة القوية (Legendary & Mythical)
  // ===================================
  phantasm: { id: 'phantasm', name: 'الخيال (Phantasm)', type: 'weapon', description: 'قوس يطلق سهام أشباح.', damage: 120, rarity: 'legendary' },
  dragon_slayer: { id: 'dragon_slayer', name: 'قاتل التنين', type: 'weapon', description: 'سيف مصمم لقتل التنانين.', damage: 120, rarity: 'legendary' },
  death_scythe: { id: 'death_scythe', name: 'منجل الموت', type: 'weapon', description: 'منجل يسحب أرواح الأعداء.', damage: 130, rarity: 'legendary' },
  flame_dragons_blade: { id: 'flame_dragons_blade', name: 'سيف تنين اللهب', type: 'weapon', description: 'سيف يحمل قوة التنين.', damage: 150, rarity: 'legendary' },
  abyssal_edge: { id: 'abyssal_edge', name: 'حدود الهاوية', type: 'weapon', description: 'شفرة مظلمة لا نهاية لها.', damage: 160, rarity: 'legendary' },
  razorblade_typhoon: { 
    id: 'razorblade_typhoon', 
    name: 'رازبليد تايفون', 
    type: 'weapon', 
    description: 'يطلق إعصار من الشفرات.', 
    damage: 160, 
    rarity: 'legendary', 
    materials: [
      { id: 'soul_of_sight', count: 5 }, 
      { id: 'soul_of_might', count: 5 }, 
      { id: 'soul_of_fright', count: 5 }, 
      { id: 'hallowed_bar', count: 10 } 
    ]
  },
  phoenix_bow: { id: 'phoenix_bow', name: 'قوس الفينيق', type: 'weapon', description: 'يطلق سهام نارية متجددة.', damage: 170, rarity: 'legendary' },
  daybreak: { id: 'daybreak', name: 'شروق الشمس', type: 'weapon', description: 'رمح يسبب ضرراً شمسيًا متواصلاً.', damage: 190, rarity: 'legendary' },
  terra_blade: { 
    id: 'terra_blade', 
    name: 'سيف الأرض', 
    type: 'weapon', 
    description: 'قوة الأرض الخارقة.', 
    damage: 200, 
    rarity: 'legendary', 
    materials: [
      // نحتاج تعريف الأسلحة المكونة الأخرى
      { id: 'true_excalibur', count: 1 }, 
      { id: 'true_nights_edge', count: 1 } 
    ] 
  },
  celebration: { id: 'celebration', name: 'الاحتفال', type: 'weapon', description: 'تطلق صواريخ ملوّنة ومدمرة.', damage: 200, rarity: 'legendary' },
  nebula_blaze: { id: 'nebula_blaze', name: 'نبيولا بليز', type: 'weapon', description: 'قاذف سحري سريع.', damage: 210, rarity: 'legendary', materials: [{ id: 'nebula_fragments', count: 18 }] },
  daedalus_stormbow: { id: 'daedalus_stormbow', name: 'قوس العاصفة ديدالوس', type: 'weapon', description: 'يطلق سهام المطر.', damage: 250, rarity: 'legendary' },
  the_deathbringer: { id: 'the_deathbringer', name: 'المؤتي بالموت', type: 'weapon', description: 'يستخدمه اللورد المظلم لإنهاء الحياة.', damage: 250, rarity: 'mythical' },
  star_wrath: { id: 'star_wrath', name: 'غضب النجم', type: 'weapon', description: 'يستدعي نجوماً من السماء.', damage: 300, rarity: 'mythical' },
  gods_wrath: { id: 'gods_wrath', name: 'غضب الإله', type: 'weapon', description: 'سلاح حاكم الظل.', damage: 300, rarity: 'mythical' },
  the_last_prism: { id: 'the_last_prism', name: 'البرسم الأخير', type: 'weapon', description: 'يطلق شعاع ليزر سحري متعدد الألوان.', damage: 300, rarity: 'mythical' },
  doomhammer: { id: 'doomhammer', name: 'مطرقة الهلاك', type: 'weapon', description: 'مطرقة حاكم التحطيم.', damage: 350, rarity: 'mythical' },
  divine_sword: { 
    id: 'divine_sword', 
    name: 'سيف الإله', 
    type: 'weapon', 
    description: 'سيف مصنوع من مواد إلهية.', 
    damage: 400, 
    rarity: 'mythical', 
    materials: [
      { id: 'divine_fragments', count: 5 }, 
      { id: 'sacred_steel', count: 10 }
    ] 
  },
  soulfire_blade: { 
    id: 'soulfire_blade', 
    name: 'سيف نار الروح', 
    type: 'weapon', 
    description: 'شفرة مشتعلة بأرواح الأعداء.', 
    damage: 500, 
    rarity: 'mythical', 
    materials: [
      { id: 'soul_shards', count: 10 }, 
      { id: 'dark_iron', count: 15 }
    ]
  },
  oblivions_end: { id: 'oblivions_end', name: 'نهاية العدم', type: 'weapon', description: 'سلاح يتجاهل دفاعات العدو.', damage: 600, rarity: 'mythical' },
  divinitys_edge: { id: 'divinitys_edge', name: 'حدود الإلوهية', type: 'weapon', description: 'سلاح الإله السماوي الأقوى.', damage: 700, rarity: 'mythical' },
  meowmere: { id: 'meowmere', name: 'الميومير', type: 'weapon', description: 'سيف مجنون يطلق رؤوس قطط مفرقعة.', damage: 200, rarity: 'mythical' },


  // ===================================
  // Drops & Souls & Fragments (من قائمة الوحوش السابقة)
  // ===================================
  slime_gel: { id: 'slime_gel', name: 'جل الوحل', type: 'drop', description: 'مادة لزجة، تستخدم في صناعة المصابيح والمتفجرات.', rarity: 'common' },
  bone: { id: 'bone', name: 'عظمة', type: 'drop', description: 'عظام من الهياكل العظمية والزومبي، تستخدم في الصناعة.', rarity: 'common' },
  // ... (تم حذف القطرات الأخرى للاختصار، لكن يجب أن تبقى في ملفك الكامل)
  
  // الموارد النادرة والأسطورية التي لا تُجمع (Drops/Crafting Components)
  lihzahrd_power_cell: { id: 'lihzahrd_power_cell', name: 'خلية قوة ليهزار', type: 'material', description: 'لتفعيل الغولم.', rarity: 'rare' },
  wyvern_wings: { id: 'wyvern_wings', name: 'أجنحة الوايفرن', type: 'accessory', description: 'أجنحة طائرة.', rarity: 'rare' },
  souls_of_flight: { id: 'souls_of_flight', name: 'أرواح الطيران', type: 'soul', description: 'أرواح ضرورية لصناعة الأجنحة.', rarity: 'rare' },
  soul_of_light: { id: 'soul_of_light', name: 'روح الضوء', type: 'soul', description: 'روح منبعثة من مناطق النور.', rarity: 'rare' },
  soul_of_might: { id: 'soul_of_might', name: 'روح القوة', type: 'soul', description: 'روح تمنح قوة مادية.', rarity: 'rare' },
  soul_of_fright: { id: 'soul_of_fright', name: 'روح الفزع', type: 'soul', description: 'أرواح تسقطها وحوش متقدمة.' , rarity: 'rare'}, // مفترض لصناعة Razorblade Typhoon
  solar_fragment: { id: 'solar_fragment', name: 'شظايا شمسية', type: 'fragment', description: 'أجزاء من الشمس، شديدة الحرارة.', rarity: 'rare' },
  nebula_fragments: { id: 'nebula_fragments', name: 'شظايا سديم', type: 'fragment', description: 'تستخدم لصناعة أسلحة النجم.', rarity: 'rare' }, // مفترض لصناعة Nebula Blaze
  divine_fragment: { id: 'divine_fragment', name: 'شظايا إلهية', type: 'fragment', description: 'أجزاء من قوى إلهية.', rarity: 'legendary' },
  sacred_steel: { id: 'sacred_steel', name: 'الصلب المقدس', type: 'material', description: 'صلب يطهر الشر.', rarity: 'mythical' },
  soul_shards: { id: 'soul_shards', name: 'شظايا الروح', type: 'material', description: 'أجزاء من أرواح الأعداء الأقوياء.', rarity: 'legendary' },
};
