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
  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'completed'],
    default: 'pending'
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: null
  },
  playerId: {
    type: String,
    unique: true,
    sparse: true
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: String,
    default: null
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
  // 🆕 خصائص النشاط (Stamina)
  stamina: {
    type: Number,
    default: 100,
    min: 0
  },
  maxStamina: {
    type: Number,
    default: 100,
    min: 1
  },
  lastStaminaAction: {
      type: Date,
      default: Date.now
  },
  // نهاية خصائص النشاط
  currentLocation: {
    type: String,
    default: 'forest'
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
    accessory: { type: String, default: null },
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

playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ========== دوال المثيل (Instance Methods) ==========

// 🆕 حساب النشاط الحالي مع الأخذ في الاعتبار التجديد الزمني
playerSchema.methods.getActualStamina = function() {
    const recoveryRate = 5; // 5 نقاط نشاط لكل دقيقة
    const maxStam = this.maxStamina || 100;
    
    const lastActionTime = this.lastStaminaAction ? this.lastStaminaAction.getTime() : Date.now();
    const now = Date.now();
    
    const minutesPassed = (now - lastActionTime) / (1000 * 60); 
    const recoveredStamina = Math.floor(minutesPassed * recoveryRate);
    
    let actualStamina = Math.min(this.stamina + recoveredStamina, maxStam);
    
    this.stamina = actualStamina;
    if (recoveredStamina > 0) {
        this.lastStaminaAction = new Date(now); 
    }
    
    return actualStamina;
};

// 🆕 استخدام النشاط
playerSchema.methods.useStamina = function(amount) {
    const actualStamina = this.getActualStamina();
    
    if (actualStamina >= amount) {
        this.stamina = actualStamina - amount;
        this.lastStaminaAction = Date.now(); 
        return true;
    }
    return false;
};

playerSchema.methods.isApproved = function() {
  return this.registrationStatus === 'completed';
};

playerSchema.methods.isPending = function() {
  return this.registrationStatus === 'pending';
};

playerSchema.methods.isApprovedButNotCompleted = function() {
  return this.registrationStatus === 'approved';
};

playerSchema.methods.getRegistrationStatus = function() {
  return this.registrationStatus;
};

playerSchema.methods.getCurrentLocation = function() {
  return this.currentLocation || 'forest';
};

// 🛠️ دالة addItem - تم تحديثها لضمان وجود Name و Type دائمًا
playerSchema.methods.addItem = function(id, name, type, quantity = 1) {
  if (!this.inventory) {
    this.inventory = [];
  }
  
  // 💡 ضمان أن الاسم والنوع لا يكونا null أو undefined قبل الإضافة
  const itemName = name || id; 
  const itemType = type || 'unknown'; 
  
  const existingItem = this.inventory.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.inventory.push({ 
      id, 
      name: itemName, 
      type: itemType, 
      quantity 
    });
  }
  
  if (itemType === 'resource' || itemType === 'resource') {
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
    return true;
  }
  return false;
};

playerSchema.methods.levelUp = function() {
  this.level = (this.level || 1) + 1;
  this.experience = 0;
  this.maxHealth = (this.maxHealth || 100) + 20;
  this.health = this.maxHealth;
  this.maxMana = (this.maxMana || 50) + 10;
  this.mana = this.maxMana;
  
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
  return this.health > 0;
};

playerSchema.methods.isAlive = function() {
  return (this.health || 0) > 0;
};

playerSchema.methods.respawn = function() {
  this.health = this.maxHealth || 100;
  this.mana = this.maxMana || 50;
  this.stamina = this.maxStamina || 100;
  this.lastStaminaAction = Date.now();
  this.currentLocation = 'forest'; 
  
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
    return null;
  }
  return Math.ceil((cooldown - new Date()) / 1000 / 60);
};

/**
 * 🆕 تجهيز عنصر في خانة محددة
 * @param {string} itemId الـ ID الإنجليزي للعنصر
 * @param {string} itemType النوع المتوقع للعنصر ('weapon', 'armor', 'accessory', 'tool')
 * @param {object} itemsData بيانات جميع العناصر المستوردة (للحصول على الاسم والإحصائيات)
 */
playerSchema.methods.equipItem = function(itemId, itemType, itemsData) {
    if (this.getItemQuantity(itemId) === 0) {
        return { error: `❌ لا تملك العنصر ${itemsData[itemId]?.name || itemId} لتجهيزه.` };
    }
    
    // 1. تحديد الخانة بناءً على النوع
    const slotMap = { 'weapon': 'weapon', 'armor': 'armor', 'accessory': 'accessory', 'tool': 'tool' };
    const slot = slotMap[itemType] || null;
    
    if (!slot) {
         return { error: `❌ النوع "${itemType}" لا يمكن تجهيزه في خانة معدات.` };
    }

    // 2. نزع العنصر القديم (إذا كان هناك واحد)
    const oldItemId = this.equipment[slot];
    if (oldItemId === itemId) {
        return { error: `❌ العنصر ${itemsData[itemId]?.name || itemId} مجهز بالفعل في خانة ${slot}.` };
    }
    if (oldItemId) {
        this.equipment[slot] = null; // نزع العنصر القديم أولاً
    }

    // 3. تجهيز العنصر الجديد
    this.equipment[slot] = itemId;

    return { 
        success: true, 
        message: `✅ تم تجهيز ${itemsData[itemId]?.name || itemId} في خانة ${slot}.`,
        oldItemId: oldItemId
    };
};

/**
 * 🆕 نزع عنصر من خانة محددة
 */
playerSchema.methods.unequipItem = function(slot, itemsData) {
    const validSlots = ['weapon', 'armor', 'accessory', 'tool'];
    if (!validSlots.includes(slot)) {
        return { error: '❌ الخانة غير صالحة. استخدم: weapon, armor, accessory, tool.' };
    }
    
    const unequippedItem = this.equipment[slot];
    if (!unequippedItem) {
        return { error: `❌ لا يوجد شيء مجهز في خانة ${slot}.` };
    }
    
    this.equipment[slot] = null;
    
    return { 
        success: true, 
        message: `✅ تم نزع ${itemsData[unequippedItem]?.name || unequippedItem} من خانة ${slot}.` 
    };
};

/**
 * 🛠️ دالة حساب قوة الهجوم الإجمالية
 */
playerSchema.methods.getAttackDamage = function(itemsData) {
  let baseDamage = 10;
  let multiplier = (this.skills && this.skills.combat) || 1;
  
  baseDamage += ((this.level || 1) - 1) * 2;
  
  // 1. إضافة إحصائيات المعدات المجهزة
  for (const slot in this.equipment) {
      const equippedItemId = this.equipment[slot];
      if (equippedItemId) {
          const itemStats = itemsData[equippedItemId]?.stats || {}; 
          if (itemStats.damage) {
              baseDamage += itemStats.damage;
          }
      }
  }
  
  return Math.floor(baseDamage * multiplier);
};

/**
 * 🛠️ دالة حساب قوة الدفاع الإجمالية
 */
playerSchema.methods.getDefense = function(itemsData) {
  let baseDefense = 5;
  let multiplier = (this.skills && this.skills.combat) || 1;
  
  baseDefense += ((this.level || 1) - 1) * 1;
  
  // 1. إضافة إحصائيات المعدات المجهزة
  for (const slot in this.equipment) {
      const equippedItemId = this.equipment[slot];
      if (equippedItemId) {
          const itemStats = itemsData[equippedItemId]?.stats || {};
          if (itemStats.defense) {
              baseDefense += itemStats.defense;
          }
      }
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

// ========== دوال ثابتة (Static Methods) ==========

// 🆕 دالة للحصول على آخر ID رقمي مستخدم
playerSchema.statics.getLastNumericId = async function() {
    const lastPlayer = await this.findOne({ playerId: { $ne: null } })
        .sort({ createdAt: -1 })
        .exec();

    const lastId = lastPlayer?.playerId ? parseInt(lastPlayer.playerId, 10) : 0;
    return isNaN(lastId) ? 1000 : (lastId >= 1000 ? lastId : 1000); 
};

playerSchema.statics.createNew = async function(userId, name) {
  try {
    const player = new this({
      userId,
      name,
      registrationStatus: 'pending',
      gender: null,
      playerId: null,
      approvedAt: null,
      approvedBy: null,
      level: 1,
      experience: 0,
      gold: 50,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      stamina: 100,
      maxStamina: 100,
      lastStaminaAction: Date.now(),
      currentLocation: 'forest',
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
        accessory: null,
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
    
    if (error.code === 11000) {
      const existingPlayer = await this.findOne({ userId });
      if (existingPlayer) {
        console.log('✅ وجد لاعب موجود بالفعل:', existingPlayer.name);
        return existingPlayer;
      }
    }
    
    throw error;
  }
};

playerSchema.statics.findByUserId = async function(userId) {
  return await this.findOne({ userId });
};

playerSchema.statics.getTopPlayers = async function(limit = 10) {
  return await this.find({ 
    banned: false,
    registrationStatus: 'completed'
  })
    .sort({ level: -1, experience: -1, gold: -1 })
    .limit(limit);
};

playerSchema.statics.getPendingPlayers = async function() {
  return await this.find({ 
    registrationStatus: 'pending' 
  }).select('userId name createdAt');
};

// ========== دوال افتراضية (Virtuals) ==========

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

// ========== التصدير ==========

const Player = mongoose.model('Player', playerSchema);
export default Player;
