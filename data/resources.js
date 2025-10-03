export const resources = [
  // --- الموارد السهلة إلى المتوسطة ---
  {
    id: "slime_gel",
    name: "جل الوحل",
    obtain: "يسقطها Slime (الوحل)",
    rarity: "سهل",
    regions: ["الغابة", "الصحراء", "الأرض"]
  },
  {
    id: "wood",
    name: "خشب",
    obtain: "يُجمع من الأشجار",
    rarity: "سهل",
    regions: ["الغابات", "الأراضي"]
  },
  {
    id: "stone",
    name: "حجر",
    obtain: "يُجمع من الصخور",
    rarity: "سهل",
    regions: ["الغابات", "الأراضي"]
  },
  {
    id: "gold_ore",
    name: "خام الذهب",
    obtain: "يُستخرج من الخامات في الأرض",
    rarity: "سهل",
    regions: ["الكهوف", "الأراضي الجبلية"]
  },
  {
    id: "iron_ore",
    name: "خام الحديد",
    obtain: "يُستخرج من الخامات في الأرض",
    rarity: "سهل",
    regions: ["الكهوف", "الأراضي الجبلية"]
  },
  {
    id: "copper_ore",
    name: "خام النحاس",
    obtain: "يُستخرج من الخامات في الأرض",
    rarity: "سهل",
    regions: ["الكهوف", "الأراضي الجبلية"]
  },
  {
    id: "demonite_ore",
    name: "خام الشيطان",
    obtain: "يُستخرج بعد هزيمة Eye of Cthulhu",
    rarity: "سهل",
    regions: ["الأرض"]
  },
  {
    id: "silver_ore",
    name: "خام الفضة",
    obtain: "يُستخرج من الخامات في الأرض",
    rarity: "سهل",
    regions: ["الكهوف", "الأراضي الجبلية"]
  },
  {
    id: "moon_dust",
    name: "غبار القمر",
    obtain: "يسقطها Moon Lord",
    rarity: "سهل",
    regions: ["جميع المناطق بعد تدمير الأبراج القمرية"]
  },
  {
    id: "soul_of_light",
    name: "روح الضوء",
    obtain: "يسقطها The Twins",
    rarity: "سهل",
    regions: ["مناطق Hardmode"]
  },

  // --- الموارد المتوسطة ---
  {
    id: "vine",
    name: "الكرمة",
    obtain: "يُجمع من الكروم في الغابات",
    rarity: "متوسط",
    regions: ["الغابات", "الأدغال"]
  },
  {
    id: "lihzahrd_power_cell",
    name: "خلية قوة ليهزار",
    obtain: "يسقطها Golem",
    rarity: "متوسط",
    regions: ["معبد الغابة"]
  },
  {
    id: "hellstone",
    name: "حجر الجحيم",
    obtain: "يُستخرج من الكهوف في الجحيم",
    rarity: "متوسط",
    regions: ["الجحيم"]
  },
  {
    id: "wyvern_wings",
    name: "أجنحة الوايفرن",
    obtain: "يسقطها Wyvern",
    rarity: "متوسط",
    regions: ["السماء"]
  },
  {
    id: "honey",
    name: "عسل",
    obtain: "يتم جمعه من خلايا النحل في الغابات",
    rarity: "متوسط",
    regions: ["الغابات"]
  },
  {
    id: "plantera_bulb",
    name: "زهرة بلانتيرا",
    obtain: "يُحصل عليها بعد تدمير أوعية الغابة الجوفية",
    rarity: "متوسط",
    regions: ["الغابة الجوفية"]
  },
  {
    id: "solar_fragment",
    name: "شظايا شمسية",
    obtain: "يسقطها Solar Eclipse",
    rarity: "متوسط",
    regions: ["كافة مناطق اللعبة خلال حدث الكسوف الشمسي"]
  },
  {
    id: "soul_of_might",
    name: "روح القوة",
    obtain: "يسقطها The Twins",
    rarity: "متوسط",
    regions: ["كافة مناطق اللعبة بعد دخول Hardmode"]
  },

  // --- الموارد الصعبة ---
  {
    id: "abyssal_blade",
    name: "شفرة الهاوية",
    obtain: "يسقطها Abyssal Lord",
    rarity: "صعب",
    regions: ["بوابات Ultimate Dungeon"]
  },
  {
    id: "dragon_king_horn",
    name: "قرن ملك التنين",
    obtain: "يسقطها Dragon King",
    rarity: "صعب",
    regions: ["بوابات Double Dungeon"]
  },
  {
    id: "soul_of_night",
    name: "روح الليل",
    obtain: "يسقطها Dark Knight",
    rarity: "صعب",
    regions: ["الكهوف بعد دخول Hardmode"]
  },
  {
    id: "dark_abyss_core",
    name: "جوهر الهاوية المظلمة",
    obtain: "يسقطها Abyssal Lord",
    rarity: "صعب",
    regions: ["بوابات Ultimate Dungeon"]
  },
  {
    id: "infernal_ring",
    name: "حلقة الجحيم",
    obtain: "يسقطها Infernal Beast",
    rarity: "صعب",
    regions: ["الجحيم"]
  },
  {
    id: "divine_fragment",
    name: "شظايا إلهية",
    obtain: "يمكن صنعها باستخدام عدة موارد نادرة في اللعبة",
    rarity: "صعب",
    regions: ["بعد إتمام بعض المهام المتقدمة"]
  },

  // --- الموارد النادرة (الأسطورية) ---
  {
    id: "gods_essence",
    name: "جوهر الإله",
    obtain: "يسقطها Celestial God",
    rarity: "نادر جدًا",
    regions: ["بوابات Divine Dungeon"]
  },
  {
    id: "divine_steel",
    name: "الصلب الإلهي",
    obtain: "يُصنع باستخدام Divine Shards",
    rarity: "نادر جدًا",
    regions: ["بوابات Divine Dungeon"]
  },
  {
    id: "soul_shards",
    name: "شظايا الروح",
    obtain: "يسقطها Soulfire Dragon",
    rarity: "نادر جدًا",
    regions: ["المراحل النهائية"]
  },
  {
    id: "sacred_steel",
    name: "الصلب المقدس",
    obtain: "يُصنع باستخدام Divine Fragments و Soul of Light",
    rarity: "نادر جدًا",
    regions: ["بوابات Heavenly Dungeon"]
  },

  // --- الموارد الفائقة ---
  {
    id: "celestial_fragment",
    name: "شظايا سماوية",
    obtain: "يسقطها Celestial Dragon",
    rarity: "نادر جدًا",
    regions: ["المراحل النهائية من اللعبة"]
  },
  {
    id: "dark_crystal",
    name: "البلورة المظلمة",
    obtain: "يسقطها Ghoul",
    rarity: "نادر جدًا",
    regions: ["بوابات A-S"]
  }
];