import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  }
}, { _id: false });

const playerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  gold: {
    type: Number,
    default: 50,
    min: 0
  },
  health: {
    type: Number,
    default: 100,
    min: 0
  },
  maxHealth: {
    type: Number,
    default: 100,
    min: 1
  },
  mana: {
    type: Number,
    default: 50,
    min: 0
  },
  maxMana: {
    type: Number,
    default: 50,
    min: 0
  },
  currentLocation: {
    type: String,
    default: 'القرية'
  },
  inventory: [inventoryItemSchema],
  skills: {
    gathering: { type: Number, default: 1, min: 1 },
    combat: { type: Number, default: 1, min: 1 },
    crafting: { type: Number, default: 1, min: 1 }
  },
  equipment: {
    weapon: { type: String, default: null },
    armor: { type: String, default: null },
    tool: { type: String, default: null }
  },
  stats: {
    battlesWon: { type: Number, default: 0, min: 0 },
    battlesLost: { type: Number, default: 0, min: 0 },
    monstersKilled: { type: Number, default: 0, min: 0 },
    questsCompleted: { type: Number, default: 0, min: 0 },
    resourcesGathered: { type: Number, default: 0, min: 0 },
    itemsCrafted: { type: Number, default: 0, min: 0 }
  },
  lastAction: {
    type: Date,
    default: Date.now
  },
  cooldowns: {
    gather: { type: Date, default: null },
    battle: { type: Date, default: null },
    craft: { type: Date, default: null }
  },
  banned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// تحديث updatedAt قبل الحفظ
playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// دوال المثيل (Instance Methods)
playerSchema.methods.addItem = function(id, name, type, quantity = 1) {
  // تأكد من وجود inventory
  if (!this.inventory) {
    this.inventory = [];
  }
  
  const existingItem = this.inventory.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.inventory.push({ 
      id, 
      name, 
      type, 
      quantity 
    });
  }
  
  // تحديث الإحصائيات إذا كان المورد
  if (type === 'resource') {
    if (!this.stats) this.stats = {};
    this.stats.resourcesGathered = (this.stats.resourcesGathered || 0) + quantity;
  }
};

playerSchema.methods.removeItem = function(id, quantity = 1) {
  if (!this.inventory) return false;
  
  const itemIndex = this.inventory.findIndex(item => item.id === id);
  
  if (itemIndex !== -1) {
    const item = this.inventory[itemIndex];
    
    if (item.quantity > quantity) {
      item.quantity -= quantity;
    } else {
      this.inventory.splice(itemIndex, 1);
    }
    return true;
  }
  return false;
};

playerSchema.methods.getItemQuantity = function(id) {
  if (!this.inventory) return 0;
  
  const item = this.inventory.find(item => item.id === id);
  return item ? item.quantity : 0;
};

playerSchema.methods.addGold = function(amount) {
  this.gold = (this.gold || 0) + amount;
  if (this.gold < 0) this.gold = 0;
};

playerSchema.methods.removeGold = function(amount) {
  const currentGold = this.gold || 0;
  if (currentGold >= amount) {
    this.gold = currentGold - amount;
    return true;
  }
  return false;
};

playerSchema.methods.addExperience = function(amount) {
  this.experience = (this.experience || 0) + amount;
  const requiredExp = (this.level || 1) * 100;
  
  if (this.experience >= requiredExp) {
    this.levelUp();
    return true; // مستوى-up حدث
  }
  return false; // لم يحدث مستوى-up
};

playerSchema.methods.levelUp = function() {
  this.level = (this.level || 1) + 1;
  this.experience = 0;
  this.maxHealth = (this.maxHealth || 100) + 20;
  this.health = this.maxHealth; // تعبئة الصحة بالكامل عند المستوى الجديد
  this.maxMana = (this.maxMana || 50) + 10;
  this.mana = this.maxMana; // تعبئة المانا بالكامل
  
  // تحسين المهارات مع كل مستوى
  if (!this.skills) this.skills = { gathering: 1, combat: 1, crafting: 1 };
  this.skills.combat += 0.1;
  this.skills.gathering += 0.1;
  this.skills.crafting += 0.1;
};

playerSchema.methods.heal = function(amount) {
  this.health = (this.health || 0) + amount;
  if (this.health > this.maxHealth) {
    this.health = this.maxHealth;
  }
};

playerSchema.methods.takeDamage = function(amount) {
  this.health = (this.health || 0) - amount;
  if (this.health < 0) {
    this.health = 0;
  }
  return this.health > 0; // يرجع true إذا لا يزال حياً
};

playerSchema.methods.isAlive = function() {
  return (this.health || 0) > 0;
};

playerSchema.methods.respawn = function() {
  this.health = this.maxHealth || 100;
  this.mana = this.maxMana || 50;
  this.currentLocation = 'القرية';
  
  // خسارة بعض الذهب عند الموت
  const goldLoss = Math.floor((this.gold || 0) * 0.1);
  this.gold = Math.max(0, (this.gold || 0) - goldLoss);
  
  return goldLoss;
};

playerSchema.methods.setCooldown = function(action, minutes = 1) {
  if (!this.cooldowns) this.cooldowns = {};
  
  const cooldownTime = new Date();
  cooldownTime.setMinutes(cooldownTime.getMinutes() + minutes);
  this.cooldowns[action] = cooldownTime;
};

playerSchema.methods.getCooldown = function(action) {
  if (!this.cooldowns) return null;
  
  const cooldown = this.cooldowns[action];
  if (!cooldown || new Date() > cooldown) {
    return null; // لا يوجد توقيت تبريد أو انتهى
  }
  return Math.ceil((cooldown - new Date()) / 1000 / 60); // يرجع الدقائق المتبقية
};

playerSchema.methods.equipItem = function(itemId, slot) {
  const validSlots = ['weapon', 'armor', 'tool'];
  if (!validSlots.includes(slot)) {
    return false;
  }
  
  // تأكد من وجود equipment
  if (!this.equipment) {
    this.equipment = { weapon: null, armor: null, tool: null };
  }
  
  // تأكد من أن العنصر موجود في الحقيبة
  if (!this.getItemQuantity(itemId)) {
    return false;
  }
  
  this.equipment[slot] = itemId;
  return true;
};

playerSchema.methods.unequipItem = function(slot) {
  const validSlots = ['weapon', 'armor', 'tool'];
  if (!validSlots.includes(slot)) {
    return false;
  }
  
  if (!this.equipment) {
    this.equipment = { weapon: null, armor: null, tool: null };
  }
  
  this.equipment[slot] = null;
  return true;
};

playerSchema.methods.getAttackDamage = function() {
  let baseDamage = 10;
  let multiplier = (this.skills && this.skills.combat) || 1;
  
  // إضافة ضرر بناءً على المستوى
  baseDamage += ((this.level || 1) - 1) * 2;
  
  // إذا كان هناك سلاح مُجهز
  if (this.equipment && this.equipment.weapon) {
    baseDamage += 5;
  }
  
  return Math.floor(baseDamage * multiplier);
};

playerSchema.methods.getDefense = function() {
  let baseDefense = 5;
  let multiplier = (this.skills && this.skills.combat) || 1;
  
  // إضافة دفاع بناءً على المستوى
  baseDefense += ((this.level || 1) - 1) * 1;
  
  // إذا كان هناك درع مُجهز
  if (this.equipment && this.equipment.armor) {
    baseDefense += 3;
  }
  
  return Math.floor(baseDefense * multiplier);
};

playerSchema.methods.getGatherEfficiency = function() {
  return (this.skills && this.skills.gathering) || 1;
};

playerSchema.methods.useMana = function(amount) {
  const currentMana = this.mana || 0;
  if (currentMana >= amount) {
    this.mana = currentMana - amount;
    return true;
  }
  return false;
};

playerSchema.methods.restoreMana = function(amount) {
  this.mana = Math.min((this.mana || 0) + amount, this.maxMana || 50);
};

// دوال ثابتة (Static Methods)
playerSchema.statics.createNew = async function(userId, name) {
  try {
    const player = new this({
      userId,
      name,
      level: 1,
      experience: 0,
      gold: 50,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      currentLocation: 'القرية',
      inventory: [
        { 
          id: 'wood', 
          name: 'خشب', 
          type: 'resource', 
          quantity: 5 
        },
        { 
          id: 'stone', 
          name: 'حجر', 
          type: 'resource', 
          quantity: 3 
        }
      ],
      skills: {
        gathering: 1,
        combat: 1,
        crafting: 1
      },
      equipment: {
        weapon: null,
        armor: null,
        tool: null
      },
      stats: {
        battlesWon: 0,
        battlesLost: 0,
        monstersKilled: 0,
        questsCompleted: 0,
        resourcesGathered: 0,
        itemsCrafted: 0
      },
      cooldowns: {
        gather: null,
        battle: null,
        craft: null
      }
    });
    
    await player.save();
    return player;
  } catch (error) {
    console.error('Error creating new player:', error);
    throw error;
  }
};

playerSchema.statics.findByUserId = async function(userId) {
  return await this.findOne({ userId });
};

playerSchema.statics.getTopPlayers = async function(limit = 10) {
  return await this.find({ banned: false })
    .sort({ level: -1, experience: -1, gold: -1 })
    .limit(limit);
};

// دوال افتراضية (Virtuals)
playerSchema.virtual('requiredExp').get(function() {
  return (this.level || 1) * 100;
});

playerSchema.virtual('expProgress').get(function() {
  const exp = this.experience || 0;
  const required = this.requiredExp;
  return Math.floor((exp / required) * 100) || 0;
});

playerSchema.virtual('inventoryCount').get(function() {
  if (!this.inventory) return 0;
  return this.inventory.reduce((total, item) => total + item.quantity, 0);
});

playerSchema.virtual('inventoryTypes').get(function() {
  if (!this.inventory) return 0;
  return this.inventory.length;
});

// التصدير
const Player = mongoose.model('Player', playerSchema);
export default Player;
