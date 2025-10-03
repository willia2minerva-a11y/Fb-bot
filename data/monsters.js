export const monsters = [
  // --- وحوش ضعيفة ---
  {
    id: "slime",
    name: "وحل",
    strength: "ضعيفة",
    health: 50,
    regions: ["الغابة", "الصحراء"],
    appearTime: "نهار (عشوائي)",
    drops: [{ item: "Slime Gel", chance: 100 }],
    tier: "low"
  },
  {
    id: "demon_eye",
    name: "العين الشيطانية",
    strength: "ضعيفة",
    health: 180,
    regions: ["الغابة", "الصحراء"],
    appearTime: "ليل",
    drops: [{ item: "Demon Eye Banner", chance: 10 }],
    tier: "low"
  },
  {
    id: "zombie",
    name: "زومبي",
    strength: "ضعيفة",
    health: 180,
    regions: ["الغابة", "الصحراء"],
    appearTime: "ليل",
    drops: [{ item: "Bone", chance: 100 }],
    tier: "low"
  },
  {
    id: "harpy",
    name: "هاربي",
    strength: "ضعيفة",
    health: 200,
    regions: ["السماء"],
    appearTime: "النهار في السماء",
    drops: [{ item: "Harpy Feather", chance: 50 }],
    tier: "low"
  },
  {
    id: "skeleton_low",
    name: "هيكل عظمي",
    strength: "ضعيفة",
    health: 100,
    regions: ["الغابة", "الكهوف"],
    appearTime: "الكهوف",
    drops: [{ item: "Bone", chance: 100 }],
    tier: "low"
  },
  {
    id: "vulture",
    name: "نسر",
    strength: "ضعيفة",
    health: 400,
    regions: ["الصحراء"],
    appearTime: "عشوائي في الصحراء",
    drops: [{ item: "Vulture Feather", chance: 50 }],
    tier: "low"
  },
  {
    id: "worm",
    name: "دودة",
    strength: "ضعيفة",
    health: 100,
    regions: ["الغابة", "الكهوف"],
    appearTime: "الكهوف",
    drops: [{ item: "Wiggly Worm", chance: 50 }],
    tier: "low"
  },

  // ... (تابع جميع وحوشك كما في الردود السابقة)
];