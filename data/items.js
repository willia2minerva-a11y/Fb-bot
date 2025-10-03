export const weapons = [
  // --- الأسلحة الضعيفة إلى المتوسطة ---
  {
    id: "copper_shortsword",
    name: "سيف النحاس",
    type: "weapon",
    damage: 6,
    obtain: "صناعي",
    craft: { materials: [{ item: "Copper Bar", quantity: 7 }] },
    tier: "weak"
  },
  {
    id: "iron_shortsword",
    name: "سيف الحديد",
    type: "weapon",
    damage: 7,
    obtain: "صناعي",
    craft: { materials: [{ item: "Iron Bar", quantity: 7 }] },
    tier: "weak"
  },
  {
    id: "lead_shortsword",
    name: "سيف الرصاص",
    type: "weapon",
    damage: 8,
    obtain: "صناعي",
    craft: { materials: [{ item: "Lead Bar", quantity: 7 }] },
    tier: "weak"
  },
  {
    id: "silver_shortsword",
    name: "سيف الفضة",
    type: "weapon",
    damage: 9,
    obtain: "صناعي",
    craft: { materials: [{ item: "Silver Bar", quantity: 7 }] },
    tier: "weak"
  },
  {
    id: "gold_shortsword",
    name: "سيف الذهب",
    type: "weapon",
    damage: 10,
    obtain: "صناعي",
    craft: { materials: [{ item: "Gold Bar", quantity: 7 }] },
    tier: "weak"
  },
  {
    id: "platinum_shortsword",
    name: "سيف البلاتين",
    type: "weapon",
    damage: 11,
    obtain: "صناعي",
    craft: { materials: [{ item: "Platinum Bar", quantity: 7 }] },
    tier: "weak"
  },
  {
    id: "muramasa",
    name: "موراماسا",
    type: "weapon",
    damage: 45,
    obtain: "تجدها في صندوق المعبد القديم",
    special: "سريع ويحتوي على تأثير سحري",
    tier: "mid"
  },
  // ... (تابع بقية الأسلحة كما في الردود السابقة)
];