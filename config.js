export default {
  game: {
    name: "مغارة غولد",
    version: "1.0.0",
    maxLevel: 100,
    startGold: 100,
    startHealth: 100,
    startMana: 50,
    startAttack: 10,
    startDefense: 5
  },
  
  cooldowns: {
    gather: 2 * 60 * 1000,     // 2 دقيقة
    adventure: 3 * 60 * 1000,  // 3 دقائق
    battle: 1 * 60 * 1000,     // 1 دقيقة
    quest: 5 * 60 * 1000       // 5 دقائق
  },
  
  rewards: {
    expPerLevel: 100,
    baseGoldReward: 10,
    resourceChance: 0.7,
    rareItemChance: 0.1
  },
  
  battle: {
    basePlayerDamage: 10,
    baseMonsterDamage: 8,
    criticalChance: 0.1,
    escapeChance: 0.3
  },
  
  locations: {
    'القرية': { 
      danger: 0, 
      resources: ['wood', 'herbs'],
      safeZone: true
    },
    'الغابة الخضراء': { 
      danger: 1, 
      resources: ['wood', 'herbs', 'berries'],
      safeZone: false
    },
    'جبال الظلام': { 
      danger: 2, 
      resources: ['ore', 'gems', 'crystals'],
      safeZone: false
    },
    'كهوف التنين': { 
      danger: 3, 
      resources: ['dragon_scale', 'ancient_artifacts'],
      safeZone: false
    }
  },
  
  // إعدادات التطوير
  development: {
    debug: true,
    skipCooldowns: false,
    adminUsers: ['ADMIN_USER_ID_1', 'ADMIN_USER_ID_2']
  }
};
