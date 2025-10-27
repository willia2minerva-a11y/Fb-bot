// Player.js
import mongoose from 'mongoose';
import { items } from '../data/items.js'; 

// 🆕 تصدير بيانات العناصر لاستخدامها في دوال playerSchema.pre('save')
global.itemsData = items; 

const inventoryItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 1 }
}, { _id: false });

const playerSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    registrationStatus: { type: String, enum: ['pending', 'approved', 'completed'], default: 'pending' },
    gender: { type: String, enum: ['male', 'female'], default: null },
    playerId: { type: String, unique: true, sparse: true },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null },
    level: { type: Number, default: 1, min: 1 },
    experience: { type: Number, default: 0, min: 0 },
    gold: { type: Number, default: 50, min: 0 },
    transactions: [{
        id: { type: String, required: true },
        type: { type: String, enum: ['withdrawal', 'deposit', 'transfer_sent', 'transfer_received'], required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
        targetPlayer: { type: String, default: null },
        description: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
    }],
    pendingWithdrawal: {
        amount: { type: Number, default: 0 },
        requestedAt: { type: Date, default: null },
        status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' }
    },
    health: { type: Number, default: 100, min: 0 },
    maxHealth: { type: Number, default: 100, min: 1 },
    mana: { type: Number, default: 50, min: 0 },
    maxMana: { type: Number, default: 50, min: 0 },
    stamina: { type: Number, default: 100, min: 0 },
    maxStamina: { type: Number, default: 100, min: 1 },
    lastStaminaAction: { type: Date, default: Date.now },
    // 🆕 خصائص الاستعادة التدريجية
    lastHealthRegen: { type: Date, default: Date.now },
    lastManaRegen: { type: Date, default: Date.now },
    healthRegenRate: { type: Number, default: 0.5 }, // 0.5 صحة كل 5 دقائق
    manaRegenRate: { type: Number, default: 0.3 },   // 0.3 مانا كل 5 دقائق
    regenInterval: { type: Number, default: 300000 }, // 5 دقائق بالمللي ثانية
    currentLocation: { type: String, default: 'forest' },
    lastGateEntered: { type: String, default: null },
    lastGateEnteredAt: { type: Date, default: null },
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
    lastAction: { type: Date, default: Date.now },
    cooldowns: { 
        gather: { type: Date, default: null }, 
        battle: { type: Date, default: null }, 
        craft: { type: Date, default: null } 
    },
    banned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// 🆕 دالة ثابتة محسنة للبحث عن اللاعب بأي معرف
playerSchema.statics.findPlayerByIdentifier = async function(identifier) {
    if (!identifier) return null;
    
    // إذا كان المعرف رقمي، ابحث بـ playerId أولاً
    if (/^\d+$/.test(identifier)) {
        let player = await this.findOne({ playerId: identifier });
        if (player) return player;
    }
    
    // البحث بـ userId
    let player = await this.findOne({ userId: identifier });
    if (player) return player;
    
    // البحث بالاسم (بدون حساسية)
    player = await this.findOne({ 
        name: { $regex: new RegExp(identifier, 'i') } 
    });
    
    return player;
};

playerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    // 💡 إعادة حساب الخصائص القصوى قبل الحفظ لضمان التناسق
    this.recalculateMaxStats(this.getEquippedItemStats(global.itemsData));
    next();
});

// ========== دوال المثيل (Instance Methods) ==========

// 🆕 دالة الاستعادة التلقائية للصحة والمانا
playerSchema.methods.regenerate = function() {
    const now = new Date();
    let updated = false;

    // استعادة الصحة
    const healthTimeDiff = now - this.lastHealthRegen;
    if (healthTimeDiff >= this.regenInterval) {
        const intervals = Math.floor(healthTimeDiff / this.regenInterval);
        const healthToAdd = this.healthRegenRate * intervals;
        this.health = Math.min(this.maxHealth, this.health + healthToAdd);
        this.lastHealthRegen = new Date(now.getTime() - (healthTimeDiff % this.regenInterval));
        updated = true;
    }

    // استعادة المانا
    const manaTimeDiff = now - this.lastManaRegen;
    if (manaTimeDiff >= this.regenInterval) {
        const intervals = Math.floor(manaTimeDiff / this.regenInterval);
        const manaToAdd = this.manaRegenRate * intervals;
        this.mana = Math.min(this.maxMana, this.mana + manaToAdd);
        this.lastManaRegen = new Date(now.getTime() - (manaTimeDiff % this.regenInterval));
        updated = true;
    }

    return updated;
};

// 🆕 دالة للحصول على حالة الاستعادة
playerSchema.methods.getRegenerationStatus = function() {
    const now = new Date();
    const healthTimeUntilNext = Math.max(0, this.regenInterval - (now - this.lastHealthRegen));
    const manaTimeUntilNext = Math.max(0, this.regenInterval - (now - this.lastManaRegen));
    
    const healthMinutes = Math.floor(healthTimeUntilNext / 60000);
    const healthSeconds = Math.floor((healthTimeUntilNext % 60000) / 1000);
    
    const manaMinutes = Math.floor(manaTimeUntilNext / 60000);
    const manaSeconds = Math.floor((manaTimeUntilNext % 60000) / 1000);
    
    return {
        health: `🕒 الصحة: ${healthMinutes}:${healthSeconds.toString().padStart(2, '0')}`,
        mana: `⚡ المانا: ${manaMinutes}:${manaSeconds.toString().padStart(2, '0')}`,
        rates: `📊 معدل الاستعادة: ${this.healthRegenRate} صحة | ${this.manaRegenRate} مانا كل 5 دقائق`
    };
};

// 🆕 دالة محسنة لعرض الحالة تشمل الاستعادة
playerSchema.methods.getEnhancedStatus = function() {
    const regenStatus = this.getRegenerationStatus();
    const totalStats = this.getTotalStats(global.itemsData);
    
    return `❤️ **الصحة:** ${this.health}/${this.maxHealth}\n` +
           `⚡ **المانا:** ${this.mana}/${this.maxMana}\n` +
           `🏃 **النشاط:** ${this.getActualStamina()}/${this.maxStamina}\n` +
           `🔥 **الهجوم:** ${this.getAttackDamage(global.itemsData)}\n` +
           `🛡️ **الدفاع:** ${this.getDefense(global.itemsData)}\n` +
           `🎯 **الضربة الحرجة:** ${totalStats.critChance}%\n` +
           `💚 **تجديد الصحة:** ${totalStats.healthRegen}\n` +
           `\n${regenStatus.health}\n${regenStatus.mana}\n${regenStatus.rates}`;
};

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

// دالة طلب سحب
playerSchema.methods.requestWithdrawal = function(amount) {
    if (this.gold < amount) {
        return { error: '❌ لا تملك رصيد كافٍ للسحب.' };
    }

    this.gold -= amount;
    this.pendingWithdrawal = {
        amount: amount,
        requestedAt: new Date(),
        status: 'pending'
    };

    // إضافة المعاملة
    this.transactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        description: `طلب سحب ${amount} غولد`
    });

    return { success: true, newBalance: this.gold };
};

// دالة إضافة معاملة إيداع
playerSchema.methods.addDepositTransaction = function(amount, description = 'إيداع') {
    this.transactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'deposit',
        amount: amount,
        status: 'completed',
        description: description
    });
};

// دالة الحصول على سجل المعاملات
playerSchema.methods.getTransactionHistory = function(limit = 10) {
    return this.transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
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

// 🆕 استعادة النشاط
playerSchema.methods.restoreStamina = function(amount) {
    this.stamina = Math.min((this.stamina || 0) + amount, this.maxStamina || 100);
    return this.stamina;
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
    
    // 💡 يتم تحديث maxHealth/maxMana/maxStamina الآن عبر recalculateMaxStats
    
    if (!this.skills) this.skills = { gathering: 1, combat: 1, crafting: 1 };
    this.skills.combat += 0.1;
    this.skills.gathering += 0.1;
    this.skills.crafting += 0.1;
};

// 🆕 دالة heal محسنة لتشمل الاستعادة التلقائية
playerSchema.methods.heal = function(amount) {
    // استدعاء الاستعادة التلقائية أولاً
    this.regenerate();
    this.health = (this.health || 0) + amount;
    if (this.health > this.maxHealth) {
        this.health = this.maxHealth;
    }
};

// 🆕 دالة takeDamage محسنة لتشمل الاستعادة التلقائية
playerSchema.methods.takeDamage = function(amount) {
    // استدعاء الاستعادة التلقائية أولاً
    this.regenerate();
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
    // 💡 استخدام الإحصائيات القصوى المُعاد حسابها
    this.health = this.maxHealth || 100;
    this.mana = this.maxMana || 50;
    this.stamina = this.maxStamina || 100;
    this.lastStaminaAction = Date.now();
    // 🆕 إعادة تعيين مؤقتات الاستعادة
    this.lastHealthRegen = Date.now();
    this.lastManaRegen = Date.now();
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

// 🆕 دالة مساعدة لجلب إحصائيات كل المعدات المجهزة
playerSchema.methods.getEquippedItemStats = function(itemsData) {
    const totalStats = {
        damage: 0,
        defense: 0,
        maxHealth: 0,
        maxMana: 0,
        maxStamina: 0,
        critChance: 0,
        healthRegen: 0,
    };

    if (!itemsData) return totalStats;

    for (const slot in this.equipment) {
        const equippedItemId = this.equipment[slot];
        // 💡 التحقق من وجود itemStats
        if (equippedItemId && itemsData[equippedItemId] && itemsData[equippedItemId].stats) {
            const itemStats = itemsData[equippedItemId].stats;
            totalStats.damage += itemStats.damage || 0;
            totalStats.defense += itemStats.defense || 0;
            totalStats.maxHealth += itemStats.maxHealth || 0;
            totalStats.maxMana += itemStats.maxMana || 0;
            totalStats.maxStamina += itemStats.maxStamina || 0;
            totalStats.critChance += itemStats.critChance || 0;
            totalStats.healthRegen += itemStats.healthRegen || 0;
        }
    }
    return totalStats;
};

// 🆕 دالة لإعادة حساب الخصائص القصوى بناءً على المستوى والمعدات
playerSchema.methods.recalculateMaxStats = function(equippedStats) {
    // القيم الأساسية تزيد مع المستوى (20 صحة، 10 مانا لكل مستوى)
    const baseHealth = 100 + ((this.level || 1) - 1) * 20; 
    const baseMana = 50 + ((this.level || 1) - 1) * 10;
    const baseStamina = 100;

    const newMaxHealth = baseHealth + (equippedStats.maxHealth || 0);
    const newMaxMana = baseMana + (equippedStats.maxMana || 0);
    const newMaxStamina = baseStamina + (equippedStats.maxStamina || 0);

    // التحديث
    this.maxHealth = newMaxHealth;
    this.maxMana = newMaxMana;
    this.maxStamina = newMaxStamina;

    // لضمان عدم تجاوز الإحصائيات الحالية للحد الأقصى الجديد
    this.health = Math.min(this.health, newMaxHealth);
    this.mana = Math.min(this.mana, newMaxMana);
    this.stamina = Math.min(this.stamina, newMaxStamina);
};

// 🆕 حساب الإحصائيات الإجمالية
playerSchema.methods.getTotalStats = function(itemsData) {
    const baseStats = {
        damage: 10 + ((this.level || 1) - 1) * 2,
        defense: 5 + ((this.level || 1) - 1) * 1,
        maxHealth: 100 + ((this.level || 1) - 1) * 20,
        maxMana: 50 + ((this.level || 1) - 1) * 10,
        maxStamina: 100,
        critChance: 5, // أساسي
        healthRegen: 1, // أساسي
    };

    const equippedStats = this.getEquippedItemStats(itemsData);
    
    // دمج الإحصائيات
    return {
        damage: baseStats.damage + (equippedStats.damage || 0),
        defense: baseStats.defense + (equippedStats.defense || 0),
        maxHealth: baseStats.maxHealth + (equippedStats.maxHealth || 0),
        maxMana: baseStats.maxMana + (equippedStats.maxMana || 0),
        maxStamina: baseStats.maxStamina + (equippedStats.maxStamina || 0),
        critChance: baseStats.critChance + (equippedStats.critChance || 0),
        healthRegen: baseStats.healthRegen + (equippedStats.healthRegen || 0),
    };
};

/**
 * 🆕 تجهيز عنصر في خانة محددة (محدث)
 */
playerSchema.methods.equipItem = function(itemId, itemType, itemsData) {
    if (this.getItemQuantity(itemId) === 0) {
        return { error: `❌ لا تملك العنصر ${itemsData[itemId]?.name || itemId} لتجهيزه.` };
    }

    const slotMap = { 'weapon': 'weapon', 'armor': 'armor', 'accessory': 'accessory', 'tool': 'tool' };
    const slot = slotMap[itemType] || null;

    if (!slot) {
        return { error: `❌ النوع "${itemType}" لا يمكن تجهيزه في خانة معدات.` }; 
    }

    const oldItemId = this.equipment[slot];
    if (oldItemId === itemId) {
        return { error: `❌ العنصر ${itemsData[itemId]?.name || itemId} مجهز بالفعل في خانة ${slot}.` };
    }
    
    // النزع قبل التجهيز
    if (oldItemId) {
        this.equipment[slot] = null;
    }

    this.equipment[slot] = itemId;

    // 🆕 الخطوة الجديدة: إعادة حساب الإحصائيات القصوى
    this.recalculateMaxStats(this.getEquippedItemStats(itemsData));

    return {
        success: true,
        message: `✅ تم تجهيز ${itemsData[itemId]?.name || itemId} في خانة ${slot}.`,
        oldItemId: oldItemId
    };
};

/**
 * 🆕 نزع عنصر من خانة محددة (محدث)
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

    // 🆕 الخطوة الجديدة: إعادة حساب الإحصائيات القصوى
    this.recalculateMaxStats(this.getEquippedItemStats(itemsData));

    return {
        success: true,
        message: `✅ تم نزع ${itemsData[unequippedItem]?.name || unequippedItem} من خانة ${slot}.`
    };
};

/**
 * 🛠️ دالة حساب قوة الهجوم الإجمالية (مصححة)
 */
playerSchema.methods.getAttackDamage = function(itemsData) {
    // 💡 الإصلاح: التحقق من itemsData وإرجاع القيمة الأساسية لتفادي الانهيار
    if (!itemsData) { return 10 + ((this.level || 1) - 1) * 2; } 
    
    const totalStats = this.getTotalStats(itemsData);
    const multiplier = (this.skills && this.skills.combat) || 1;
    
    return Math.floor(totalStats.damage * multiplier);
};

/**
 * 🛠️ دالة حساب قوة الدفاع الإجمالية (مصححة)
 */
playerSchema.methods.getDefense = function(itemsData) {
    // 💡 الإصلاح: التحقق من itemsData وإرجاع القيمة الأساسية لتفادي الانهيار
    if (!itemsData) { return 5 + ((this.level || 1) - 1) * 1; }
    
    const totalStats = this.getTotalStats(itemsData);
    const multiplier = (this.skills && this.skills.combat) || 1;
    
    return Math.floor(totalStats.defense * multiplier);
};

// 🆕 دالة useMana محسنة لتشمل الاستعادة التلقائية
playerSchema.methods.useMana = function(amount) {
    // استدعاء الاستعادة التلقائية أولاً
    this.regenerate();
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

playerSchema.methods.getGatherEfficiency = function() {
    return (this.skills && this.skills.gathering) || 1;
};

// ========== دوال ثابتة (Static Methods) ==========

// 🆕 دالة ثابتة جديدة للحصول على آخر معرف رقمي
playerSchema.statics.getLastNumericId = async function() {
    const lastPlayer = await this.findOne({ playerId: { $regex: /^[0-9]+$/ } }) // البحث عن playerId رقمي فقط
        .sort({ playerId: -1 }) // ترتيب تنازلي حسب playerId
        .exec();

    if (lastPlayer && lastPlayer.playerId) {
        const lastId = parseInt(lastPlayer.playerId, 10);
        if (!isNaN(lastId) && lastId >= 1000) {
            return lastId;
        }
    }
    return 1000; // البدء من 1000 إذا لم يوجد
};

playerSchema.statics.createNew = async function(userId, name) {
    try {
        // الحصول على آخر معرف رقمي
        const lastId = await this.getLastNumericId();
        const newPlayerId = (lastId + 1).toString(); // زيادة 1 وتحويل إلى سلسلة

        const player = new this({
            userId,
            name,
            registrationStatus: 'pending',
            gender: null,
            playerId: newPlayerId, // تعيين المعرف الرقمي الجديد
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
            // 🆕 تهيئة خصائص الاستعادة
            lastHealthRegen: Date.now(),
            lastManaRegen: Date.now(),
            healthRegenRate: 0.5,
            manaRegenRate: 0.3,
            regenInterval: 300000, // 5 دقائق
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
    }).select('userId name createdAt playerId'); // 🆕 إضافة playerId للعرض
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