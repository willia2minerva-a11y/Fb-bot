import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  // المعلومات الأساسية
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  
  // الإحصائيات الأساسية
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  gold: { type: Number, default: 100 },
  health: { type: Number, default: 100 },
  maxHealth: { type: Number, default: 100 },
  mana: { type: Number, default: 50 },
  maxMana: { type: Number, default: 50 },
  attack: { type: Number, default: 10 },
  defense: { type: Number, default: 5 },
  
  // الموقع والتنقل
  currentLocation: { type: String, default: 'القرية' },
  
  // الحقيبة والمعدات
  inventory: [{
    itemId: String,
    name: String,
    quantity: { type: Number, default: 1 },
    type: String, // weapon, armor, resource, potion, etc.
    rarity: { type: String, default: 'عادي' }
  }],
  
  equipment: {
    weapon: { type: String, default: null },
    armor: { type: String, default: null },
    accessory: { type: String, default: null }
  },
  
  // المهارات
  skills: [{
    skillId: String,
    name: String,
    level: { type: Number, default: 1 },
    type: String, // offensive, defensive, healing
    power: Number,
    manaCost: Number,
    cooldown: { type: Number, default: 0 },
    lastUsed: { type: Date, default: null }
  }],
  
  // المهام
  quests: [{
    questId: String,
    title: String,
    description: String,
    objectives: [{
      type: String,
      target: Number,
      current: { type: Number, default: 0 },
      itemType: { type: String, default: null }
    }],
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
  }],
  
  // الإحصائيات
  stats: {
    battlesWon: { type: Number, default: 0 },
    monstersKilled: { type: Number, default: 0 },
    questsCompleted: { type: Number, default: 0 },
    resourcesCollected: { type: Number, default: 0 },
    totalGoldEarned: { type: Number, default: 0 },
    totalExpEarned: { type: Number, default: 0 },
    playTime: { type: Number, default: 0 } // بالدقائق
  },
  
  // نظام التقدم
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now },
    rewardClaimed: { type: Boolean, default: false }
  }],
  
  // الإدارة
  banned: { type: Boolean, default: false },
  restrictedCommands: [String],
  lastAction: { type: Date, default: Date.now },
  dailyLogin: { type: Date, default: Date.now },
  loginStreak: { type: Number, default: 1 },
  
  // التواريخ
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware لتحديث updatedAt
playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ========== الدوال الثابتة ==========
playerSchema.statics.createNew = async function(userId, userName) {
  try {
    const newPlayer = new this({
      userId: userId,
      name: userName,
      level: 1,
      exp: 0,
      gold: 100,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      currentLocation: 'القرية',
      
      inventory: [
        { 
          itemId: 'beginner_sword', 
          name: 'سيف مبتدئ', 
          quantity: 1, 
          type: 'weapon',
          rarity: 'عادي'
        },
        { 
          itemId: 'small_health_potion', 
          name: 'جرعة صحة صغيرة', 
          quantity: 3, 
          type: 'potion',
          rarity: 'عادي'
        },
        { 
          itemId: 'wood', 
          name: 'خشب', 
          quantity: 5, 
          type: 'resource',
          rarity: 'عادي'
        }
      ],
      
      equipment: {
        weapon: 'beginner_sword'
      },
      
      skills: [
        { 
          skillId: 'basic_attack', 
          name: 'هجوم أساسي', 
          level: 1, 
          type: 'offensive',
          power: 15,
          manaCost: 0,
          cooldown: 0
        }
      ],
      
      quests: [],
      
      stats: {
        battlesWon: 0,
        monstersKilled: 0,
        questsCompleted: 0,
        resourcesCollected: 0,
        totalGoldEarned: 100,
        totalExpEarned: 0,
        playTime: 0
      }
    });

    await newPlayer.save();
    console.log(`🎮 لاعب جديد: ${userName} (${userId})`);
    return newPlayer;
  } catch (error) {
    console.error('❌ فشل في إنشاء لاعب جديد:', error);
    throw new Error(`فشل في إنشاء لاعب جديد: ${error.message}`);
  }
};

// ========== دوال العينات ==========
playerSchema.methods.addExp = function(expAmount) {
  this.exp += expAmount;
  this.stats.totalExpEarned += expAmount;
  
  const expNeeded = this.level * 100;
  
  if (this.exp >= expNeeded) {
    const oldLevel = this.level;
    this.level++;
    this.exp -= expNeeded;
    this.maxHealth += 20;
    this.health = this.maxHealth; // تعبئة الصحة عند الصعود مستوى
    this.maxMana += 10;
    this.mana = this.maxMana;
    this.attack += 3;
    this.defense += 2;
    
    return { 
      leveledUp: true, 
      newLevel: this.level,
      oldLevel: oldLevel
    };
  }
  
  return { leveledUp: false };
};

playerSchema.methods.addGold = function(amount) {
  this.gold += amount;
  this.stats.totalGoldEarned += amount;
  return this.gold;
};

playerSchema.methods.deductGold = function(amount) {
  if (this.gold >= amount) {
    this.gold -= amount;
    return true;
  }
  return false;
};

playerSchema.methods.addItem = function(itemId, itemName, itemType, quantity = 1, rarity = 'عادي') {
  const existingItem = this.inventory.find(item => item.itemId === itemId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.inventory.push({
      itemId,
      name: itemName,
      quantity,
      type: itemType,
      rarity
    });
  }
};

playerSchema.methods.removeItem = function(itemId, quantity = 1) {
  const itemIndex = this.inventory.findIndex(item => item.itemId === itemId);
  
  if (itemIndex !== -1) {
    if (this.inventory[itemIndex].quantity > quantity) {
      this.inventory[itemIndex].quantity -= quantity;
    } else {
      this.inventory.splice(itemIndex, 1);
    }
    return true;
  }
  return false;
};

playerSchema.methods.hasItem = function(itemId, quantity = 1) {
  const item = this.inventory.find(item => item.itemId === itemId);
  return item && item.quantity >= quantity;
};

playerSchema.methods.equipItem = function(itemId) {
  const item = this.inventory.find(item => item.itemId === itemId);
  if (!item) return false;
  
  if (item.type === 'weapon') {
    // إرجاع السلاح القديم للحقيبة إذا كان مثبتاً
    if (this.equipment.weapon) {
      this.addItem(this.equipment.weapon, 'سلاح مفكوك', 'weapon', 1);
    }
    this.equipment.weapon = itemId;
    return true;
  }
  // يمكن إضافة الدروع والإكسسوارات لاحقاً
  
  return false;
};

playerSchema.methods.learnSkill = function(skillData) {
  const existingSkill = this.skills.find(s => s.skillId === skillData.id);
  
  if (!existingSkill) {
    this.skills.push({
      skillId: skillData.id,
      name: skillData.name,
      level: 1,
      type: skillData.type,
      power: skillData.power,
      manaCost: skillData.manaCost,
      cooldown: skillData.cooldown || 0,
      lastUsed: null
    });
    return { learned: true, skill: skillData.name };
  }
  
  return { learned: false, message: 'تملك هذه المهارة بالفعل' };
};

playerSchema.methods.updateLastAction = function() {
  this.lastAction = new Date();
};

playerSchema.methods.addPlayTime = function(minutes) {
  this.stats.playTime += minutes;
};

playerSchema.methods.getTotalStats = function() {
  let totalAttack = this.attack;
  let totalDefense = this.defense;
  
  // إضافة إحصائيات المعدات
  if (this.equipment.weapon) {
    const weapon = this.inventory.find(item => item.itemId === this.equipment.weapon);
    if (weapon) {
      // يمكن إضافة منطق لحساب إحصائيات السلاح
      totalAttack += 5; // مثال
    }
  }
  
  return {
    attack: totalAttack,
    defense: totalDefense,
    health: this.health,
    maxHealth: this.maxHealth,
    mana: this.mana,
    maxMana: this.maxMana
  };
};

playerSchema.methods.heal = function(amount) {
  this.health = Math.min(this.health + amount, this.maxHealth);
  return this.health;
};

playerSchema.methods.restoreMana = function(amount) {
  this.mana = Math.min(this.mana + amount, this.maxMana);
  return this.mana;
};

playerSchema.methods.canUseSkill = function(skillId) {
  const skill = this.skills.find(s => s.skillId === skillId);
  if (!skill) return false;
  
  if (this.mana < skill.manaCost) return false;
  
  if (skill.lastUsed && skill.cooldown > 0) {
    const cooldownEnd = new Date(skill.lastUsed.getTime() + skill.cooldown * 1000);
    if (new Date() < cooldownEnd) return false;
  }
  
  return true;
};

playerSchema.methods.useSkill = function(skillId) {
  const skill = this.skills.find(s => s.skillId === skillId);
  if (!skill) return null;
  
  if (!this.canUseSkill(skillId)) return null;
  
  this.mana -= skill.manaCost;
  skill.lastUsed = new Date();
  
  return {
    damage: skill.power + (this.attack * 0.5),
    skill: skill.name,
    type: skill.type
  };
};

export default mongoose.model('Player', playerSchema);
