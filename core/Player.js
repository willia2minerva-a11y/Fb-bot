import mongoose from 'mongoose';

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
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  gold: {
    type: Number,
    default: 50
  },
  health: {
    type: Number,
    default: 100
  },
  maxHealth: {
    type: Number,
    default: 100
  },
  currentLocation: {
    type: String,
    default: 'القرية'
  },
  inventory: [{
    id: String,
    name: String,
    type: String,
    quantity: Number
  }],
  skills: {
    gathering: { type: Number, default: 1 },
    combat: { type: Number, default: 1 },
    crafting: { type: Number, default: 1 }
  },
  equipment: {
    weapon: { type: String, default: null },
    armor: { type: String, default: null },
    tool: { type: String, default: null }
  },
  stats: {
    battlesWon: { type: Number, default: 0 },
    battlesLost: { type: Number, default: 0 },
    resourcesGathered: { type: Number, default: 0 },
    itemsCrafted: { type: Number, default: 0 }
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
    this.stats.resourcesGathered += quantity;
  }
};

playerSchema.methods.removeItem = function(id, quantity = 1) {
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
  const item = this.inventory.find(item => item.id === id);
  return item ? item.quantity : 0;
};

playerSchema.methods.addGold = function(amount) {
  this.gold += amount;
  if (this.gold < 0) this.gold = 0;
};

playerSchema.methods.removeGold = function(amount) {
  if (this.gold >= amount) {
    this.gold -= amount;
    return true;
  }
  return false;
};

playerSchema.methods.addExperience = function(amount) {
  this.experience += amount;
  const requiredExp = this.level * 100;
  
  if (this.experience >= requiredExp) {
    this.levelUp();
    return true; // مستوى-up حدث
  }
  return false; // لم يحدث مستوى-up
};

playerSchema.methods.levelUp = function() {
  this.level++;
  this.experience = 0;
  this.maxHealth += 20;
  this.health = this.maxHealth; // تعبئة الصحة بالكامل عند المستوى الجديد
  
  // تحسين المهارات مع كل مستوى
  this.skills.combat += 0.1;
  this.skills.gathering += 0.1;
  this.skills.crafting += 0.1;
};

playerSchema.methods.heal = function(amount) {
  this.health += amount;
  if (this.health > this.maxHealth) {
    this.health = this.maxHealth;
  }
};

playerSchema.methods.takeDamage = function(amount) {
  this.health -= amount;
  if (this.health < 0) {
    this.health = 0;
  }
  return this.health > 0; // يرجع true إذا لا يزال حياً
};

playerSchema.methods.isAlive = function() {
  return this.health > 0;
};

playerSchema.methods.respawn = function() {
  this.health = this.maxHealth;
  this.currentLocation = 'القرية';
  // خسارة بعض الذهب عند الموت
  const goldLoss = Math.floor(this.gold * 0.1);
  this.gold -= goldLoss;
  if (this.gold < 0) this.gold = 0;
  
  return goldLoss;
};

playerSchema.methods.setCooldown = function(action, minutes = 1) {
  const cooldownTime = new Date();
  cooldownTime.setMinutes(cooldownTime.getMinutes() + minutes);
  this.cooldowns[action] = cooldownTime;
};

playerSchema.methods.getCooldown = function(action) {
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
  
  this.equipment[slot] = null;
  return true;
};

playerSchema.methods.getAttackDamage = function() {
  let baseDamage = 10;
  let multiplier = this.skills.combat;
  
  // إذا كان هناك سلاح مُجهز
  if (this.equipment.weapon) {
    // يمكن إضافة منطق لزيادة الضرر بناءً على السلاح
    baseDamage += 5;
  }
  
  return Math.floor(baseDamage * multiplier);
};

playerSchema.methods.getGatherEfficiency = function() {
  return this.skills.gathering;
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
      currentLocation: 'القرية',
      inventory: [
        { id: 'wood', name: 'خشب', type: 'resource', quantity: 5 },
        { id: 'stone', name: 'حجر', type: 'resource', quantity: 3 }
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
        resourcesGathered: 0,
        itemsCrafted: 0
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
  return this.level * 100;
});

playerSchema.virtual('expProgress').get(function() {
  return Math.floor((this.experience / this.requiredExp) * 100);
});

playerSchema.virtual('inventoryCount').get(function() {
  return this.inventory.reduce((total, item) => total + item.quantity, 0);
});

// التصدير
const Player = mongoose.model('Player', playerSchema);
export default Player;
