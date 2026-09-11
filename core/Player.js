// Player.js
import mongoose from 'mongoose';
import { items } from '../data/items.js';

global.itemsData = items;

const inventoryItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 1 }
}, { _id: false });

// ✅ تأثير مؤقت
const activeEffectSchema = new mongoose.Schema({
    type: { type: String, required: true }, // attack, defense, maxHealth, maxMana, maxStamina
    value: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
    grantedBy: String,
    grantedAt: { type: Date, default: Date.now }
}, { _id: false });

// ✅ صلاحية
const adminPermissionSchema = new mongoose.Schema({
    type: { type: String, required: true }, // full_admin, approve, ban, economy, tasks, give, content, jail, modify
    grantedBy: String,
    grantedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null } // null = دائم
}, { _id: false });

const playerSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    platform: { type: String, default: 'facebook' },
    name: { type: String, required: true },
    registrationStatus: { type: String, enum: ['pending', 'approved', 'completed'], default: 'pending' },
    gender: { type: String, enum: ['male', 'female'], default: null },
    playerId: { type: String, unique: true, sparse: true },
    originalPlayerId: { type: String, default: null }, // ✅ للاحتفاظ بـ P الأصلي
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null },
    level: { type: Number, default: 1, min: 1 },
    experience: { type: Number, default: 0, min: 0 },
    gold: { type: Number, default: 50, min: 0 },
    transactions: [{
        id: { type: String, required: true },
        type: { type: String, enum: ['withdrawal', 'deposit'], required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
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
    lastHealthRegen: { type: Date, default: Date.now },
    lastManaRegen: { type: Date, default: Date.now },
    healthRegenRate: { type: Number, default: 0.5 },
    manaRegenRate: { type: Number, default: 0.3 },
    regenInterval: { type: Number, default: 300000 },
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
    // ✅ المهام والإنجازات
    dailyTaskDate: { type: String, default: '' },
    dailyTasksList: { type: Array, default: [] },
    dailyTaskProgress: { type: Map, of: Number, default: {} },
    completedDailyTasks: { type: [String], default: [] },
    unlockedAchievements: { type: [String], default: [] },
    
    // ✅ الإحالة والمكافآت
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    referredByName: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    referredPlayers: [{
        userId: String,
        name: String,
        date: { type: Date, default: Date.now }
    }],
    lastDailyReward: { type: Date, default: null },
    dailyStreak: { type: Number, default: 0 },

    // ✅ جديد: البونص والإحصائيات
    bonusStats: {
        attack: { type: Number, default: 0 },
        defense: { type: Number, default: 0 },
        maxHealth: { type: Number, default: 0 },
        maxMana: { type: Number, default: 0 },
        maxStamina: { type: Number, default: 0 }
    },
    activeEffects: [activeEffectSchema],

    // ✅ جديد: الصلاحيات
    adminPermissions: [adminPermissionSchema],

    // ✅ جديد: السجن
    jailedUntil: { type: Date, default: null },
    jailedReason: { type: String, default: null },
    jailedBy: { type: String, default: null },
    jailNotified: { type: Boolean, default: false }, // هل أُخبر بالسجن؟

    banned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ✅ دالة البحث عن اللاعب
playerSchema.statics.findPlayerByIdentifier = async function(identifier) {
    if (!identifier) return null;

    // البحث بـ userId
    let player = await this.findOne({ userId: identifier });
    if (player) return player;

    // البحث بـ playerId
    player = await this.findOne({ playerId: identifier });
    if (player) return player;

    // البحث بالاسم
    player = await this.findOne({ name: { $regex: new RegExp(identifier, 'i') } });
    return player;
};

playerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    this.recalculateMaxStats(this.getEquippedItemStats(global.itemsData));
    next();
});

// ========== دوال المثيل ==========

// ✅ تنظيف التأثيرات المنتهية
playerSchema.methods.cleanupEffects = function() {
    const now = new Date();
    this.activeEffects = (this.activeEffects || []).filter(e => e.expiresAt > now);
    return this.activeEffects;
};

// ✅ الحصول على مجموع التأثيرات المؤقتة
playerSchema.methods.getActiveEffectsTotal = function(type) {
    this.cleanupEffects();
    return (this.activeEffects || [])
        .filter(e => e.type === type)
        .reduce((sum, e) => sum + e.value, 0);
};

// ✅ إضافة تأثير مؤقت
playerSchema.methods.addActiveEffect = function(type, value, durationMs, grantedBy) {
    this.activeEffects = this.activeEffects || [];
    this.activeEffects.push({
        type,
        value,
        expiresAt: new Date(Date.now() + durationMs),
        grantedBy,
        grantedAt: new Date()
    });
};

// ✅ فحص إذا كان مسجوناً
playerSchema.methods.isJailed = function() {
    if (!this.jailedUntil) return false;
    if (this.jailedUntil.getTime() === 0) return true; // سجن دائم (تاريخ = 0)
    return this.jailedUntil > new Date();
};

// ✅ الحصول على الصلاحيات الفعالة (بدون منتهية)
playerSchema.methods.getActivePermissions = function() {
    const now = new Date();
    return (this.adminPermissions || []).filter(p => {
        if (!p.expiresAt) return true; // دائم
        return p.expiresAt > now;
    });
};

// ✅ فحص صلاحية محددة
playerSchema.methods.hasPermission = function(permissionType) {
    const perms = this.getActivePermissions();
    if (perms.some(p => p.type === 'full_admin')) return true;
    return perms.some(p => p.type === permissionType);
};

playerSchema.methods.regenerate = function() {
    const now = new Date();
    let updated = false;

    const healthTimeDiff = now - this.lastHealthRegen;
    if (healthTimeDiff >= this.regenInterval) {
        const intervals = Math.floor(healthTimeDiff / this.regenInterval);
        const healthToAdd = this.healthRegenRate * intervals;
        this.health = Math.min(this.maxHealth, this.health + healthToAdd);
        this.lastHealthRegen = new Date(now.getTime() - (healthTimeDiff % this.regenInterval));
        updated = true;
    }

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

playerSchema.methods.isRegistrationCompleted = function() {
    return this.registrationStatus === 'completed';
};

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

playerSchema.methods.getActualStamina = function() {
    const recoveryRate = 5;
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

playerSchema.methods.requestWithdrawal = function(amount) {
    const MIN_WITHDRAWAL = 50;
    const MAX_WITHDRAWAL = 5000;

    if (amount < MIN_WITHDRAWAL) {
        return { error: `❌ الحد الأدنى للسحب: ${MIN_WITHDRAWAL} غولد` };
    }

    if (amount > MAX_WITHDRAWAL) {
        return { error: `❌ الحد الأقصى للسحب: ${MAX_WITHDRAWAL} غولد` };
    }

    if (this.gold < amount) {
        return { error: '❌ لا تملك رصيد كافٍ للسحب.' };
    }

    if (this.pendingWithdrawal?.status === 'pending') {
        this.gold += this.pendingWithdrawal.amount;
    }

    this.gold -= amount;
    this.pendingWithdrawal = {
        amount: amount,
        requestedAt: new Date(),
        status: 'pending'
    };

    this.transactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        description: `طلب سحب ${amount} غولد`
    });

    return { success: true, newBalance: this.gold };
};

playerSchema.methods.getTransactionHistory = function(limit = 10) {
    return this.transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
};

playerSchema.methods.useStamina = function(amount) {
    const actualStamina = this.getActualStamina();
    if (actualStamina >= amount) {
        this.stamina = actualStamina - amount;
        this.lastStaminaAction = Date.now();
        return true;
    }
    return false;
};

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

playerSchema.methods.getCurrentLocation = function() {
    return this.currentLocation || 'forest';
};

playerSchema.methods.addItem = function(id, name, type, quantity = 1) {
    if (!this.inventory) this.inventory = [];

    const itemName = name || id;
    const itemType = type || 'unknown';
    const existingItem = this.inventory.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.inventory.push({ id, name: itemName, type: itemType, quantity });
    }

    if (itemType === 'resource') {
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

    if (!this.skills) this.skills = { gathering: 1, combat: 1, crafting: 1 };
    this.skills.combat += 0.1;
    this.skills.gathering += 0.1;
    this.skills.crafting += 0.1;
};

playerSchema.methods.heal = function(amount) {
    this.regenerate();
    this.health = (this.health || 0) + amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
};

playerSchema.methods.takeDamage = function(amount) {
    this.regenerate();
    this.health = (this.health || 0) - amount;
    if (this.health < 0) this.health = 0;
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
    if (!cooldown || new Date() > cooldown) return null;
    return Math.ceil((cooldown - new Date()) / 1000 / 60);
};

playerSchema.methods.getEquippedItemStats = function(itemsData) {
    const totalStats = {
        damage: 0, defense: 0, maxHealth: 0, maxMana: 0,
        maxStamina: 0, critChance: 0, healthRegen: 0,
    };

    if (!itemsData) return totalStats;

    for (const slot in this.equipment) {
        const equippedItemId = this.equipment[slot];
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

playerSchema.methods.recalculateMaxStats = function(equippedStats) {
    const bonus = this.bonusStats || {};
    const baseHealth = 100 + ((this.level || 1) - 1) * 20;
    const baseMana = 50 + ((this.level || 1) - 1) * 10;
    const baseStamina = 100;

    const newMaxHealth = baseHealth + (equippedStats.maxHealth || 0) + (bonus.maxHealth || 0) + this.getActiveEffectsTotal('maxHealth');
    const newMaxMana = baseMana + (equippedStats.maxMana || 0) + (bonus.maxMana || 0) + this.getActiveEffectsTotal('maxMana');
    const newMaxStamina = baseStamina + (equippedStats.maxStamina || 0) + (bonus.maxStamina || 0) + this.getActiveEffectsTotal('maxStamina');

    this.maxHealth = newMaxHealth;
    this.maxMana = newMaxMana;
    this.maxStamina = newMaxStamina;

    this.health = Math.min(this.health, newMaxHealth);
    this.mana = Math.min(this.mana, newMaxMana);
    this.stamina = Math.min(this.stamina, newMaxStamina);
};

playerSchema.methods.getTotalStats = function(itemsData) {
    const bonus = this.bonusStats || {};
    const baseStats = {
        damage: 10 + ((this.level || 1) - 1) * 2,
        defense: 5 + ((this.level || 1) - 1) * 1,
        maxHealth: 100 + ((this.level || 1) - 1) * 20,
        maxMana: 50 + ((this.level || 1) - 1) * 10,
        maxStamina: 100,
        critChance: 5,
        healthRegen: 1,
    };

    const equippedStats = this.getEquippedItemStats(itemsData);

    return {
        damage: baseStats.damage + (equippedStats.damage || 0) + (bonus.attack || 0) + this.getActiveEffectsTotal('attack'),
        defense: baseStats.defense + (equippedStats.defense || 0) + (bonus.defense || 0) + this.getActiveEffectsTotal('defense'),
        maxHealth: baseStats.maxHealth + (equippedStats.maxHealth || 0) + (bonus.maxHealth || 0) + this.getActiveEffectsTotal('maxHealth'),
        maxMana: baseStats.maxMana + (equippedStats.maxMana || 0) + (bonus.maxMana || 0) + this.getActiveEffectsTotal('maxMana'),
        maxStamina: baseStats.maxStamina + (equippedStats.maxStamina || 0) + (bonus.maxStamina || 0) + this.getActiveEffectsTotal('maxStamina'),
        critChance: baseStats.critChance + (equippedStats.critChance || 0),
        healthRegen: baseStats.healthRegen + (equippedStats.healthRegen || 0),
    };
};

playerSchema.methods.equipItem = function(itemId, itemType, itemsData) {
    if (this.getItemQuantity(itemId) === 0) {
        return { error: `❌ لا تملك العنصر ${itemsData[itemId]?.name || itemId} لتجهيزه.` };
    }

    const slotMap = { 'weapon': 'weapon', 'armor': 'armor', 'accessory': 'accessory', 'tool': 'tool' };
    const slot = slotMap[itemType] || null;

    if (!slot) return { error: `❌ النوع "${itemType}" لا يمكن تجهيزه.` };

    const oldItemId = this.equipment[slot];
    if (oldItemId === itemId) return { error: `❌ العنصر مجهز بالفعل.` };

    if (oldItemId) this.equipment[slot] = null;
    this.equipment[slot] = itemId;
    this.recalculateMaxStats(this.getEquippedItemStats(itemsData));

    return {
        success: true,
        message: `✅ تم تجهيز ${itemsData[itemId]?.name || itemId} في خانة ${slot}.`,
        oldItemId
    };
};

playerSchema.methods.unequipItem = function(slot, itemsData) {
    const validSlots = ['weapon', 'armor', 'accessory', 'tool'];
    if (!validSlots.includes(slot)) return { error: '❌ الخانة غير صالحة.' };

    const unequippedItem = this.equipment[slot];
    if (!unequippedItem) return { error: `❌ لا يوجد شيء مجهز في خانة ${slot}.` };

    this.equipment[slot] = null;
    this.recalculateMaxStats(this.getEquippedItemStats(itemsData));

    return {
        success: true,
        message: `✅ تم نزع ${itemsData[unequippedItem]?.name || unequippedItem} من خانة ${slot}.`
    };
};

playerSchema.methods.getAttackDamage = function(itemsData) {
    if (!itemsData) return 10 + ((this.level || 1) - 1) * 2;
    const totalStats = this.getTotalStats(itemsData);
    const multiplier = (this.skills && this.skills.combat) || 1;
    return Math.floor(totalStats.damage * multiplier);
};

playerSchema.methods.getDefense = function(itemsData) {
    if (!itemsData) return 5 + ((this.level || 1) - 1) * 1;
    const totalStats = this.getTotalStats(itemsData);
    const multiplier = (this.skills && this.skills.combat) || 1;
    return Math.floor(totalStats.defense * multiplier);
};

playerSchema.methods.useMana = function(amount) {
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

// ========== دوال ثابتة ==========

// ✅ الحصول على آخر معرف لاعب (P1100 إلى P9999)
playerSchema.statics.getLastPlayerNumericId = async function() {
    const lastPlayer = await this.findOne({
        playerId: { $regex: /^P\d+$/ }
    }).sort({ playerId: -1 }).exec();

    if (lastPlayer && lastPlayer.playerId) {
        const lastId = parseInt(lastPlayer.playerId.substring(1), 10);
        if (!isNaN(lastId) && lastId >= 1100) return lastId;
    }
    return 1099; // أول لاعب سيحصل على P1100
};

// ✅ الحصول على آخر معرف مدير (1000 إلى 1099)
playerSchema.statics.getLastAdminNumericId = async function() {
    const lastAdmin = await this.findOne({
        playerId: { $regex: /^\d+$/ }
    }).sort({ playerId: -1 }).exec();

    if (lastAdmin && lastAdmin.playerId) {
        const lastId = parseInt(lastAdmin.playerId, 10);
        if (!isNaN(lastId) && lastId >= 1000) return lastId;
    }
    return 999; // أول مدير سيحصل على 1000
};

playerSchema.statics.createNew = async function(userId, name, platform = 'facebook') {
    try {
        const lastId = await this.getLastPlayerNumericId();
        const newPlayerId = `P${lastId + 1}`;

        // التحقق من عدم تجاوز النطاق
        if (lastId + 1 > 9999) {
            throw new Error('تم الوصول للحد الأقصى من اللاعبين');
        }

        const player = new this({
            userId,
            platform,
            name,
            registrationStatus: 'pending',
            gender: null,
            playerId: newPlayerId,
            approvedAt: null,
            approvedBy: null,
            level: 1,
            experience: 0,
            gold: 10,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            stamina: 100,
            maxStamina: 100,
            lastStaminaAction: Date.now(),
            lastHealthRegen: Date.now(),
            lastManaRegen: Date.now(),
            healthRegenRate: 0.5,
            manaRegenRate: 0.3,
            regenInterval: 300000,
            currentLocation: 'forest',
            inventory: [
                { id: 'wood', name: 'خشب', type: 'resource', quantity: 5 },
                { id: 'stone', name: 'حجر', type: 'resource', quantity: 3 }
            ],
            skills: { gathering: 1, combat: 1, crafting: 1 },
            equipment: { weapon: null, armor: null, accessory: null, tool: null },
            stats: {
                battlesWon: 0, battlesLost: 0, monstersKilled: 0,
                questsCompleted: 0, resourcesGathered: 0, itemsCrafted: 0
            },
            cooldowns: { gather: null, battle: null, craft: null },
            dailyTaskDate: '',
            dailyTasksList: [],
            dailyTaskProgress: {},
            completedDailyTasks: [],
            unlockedAchievements: [],
            referralCount: 0,
            referredPlayers: [],
            dailyStreak: 0,
            bonusStats: { attack: 0, defense: 0, maxHealth: 0, maxMana: 0, maxStamina: 0 },
            activeEffects: [],
            adminPermissions: []
        });

        await player.save();
        return player;

    } catch (error) {
        console.error('Error creating new player:', error);

        if (error.code === 11000) {
            const existingPlayer = await this.findOne({ userId });
            if (existingPlayer) return existingPlayer;
        }

        throw error;
    }
};

playerSchema.statics.findByUserId = async function(userId) {
    return await this.findOne({ userId });
};

playerSchema.statics.getTopPlayers = async function(limit = 10) {
    return await this.find({ banned: false, registrationStatus: 'completed' })
        .sort({ level: -1, experience: -1, gold: -1 })
        .limit(limit);
};

playerSchema.statics.getPendingPlayers = async function() {
    return await this.find({ registrationStatus: 'pending' })
        .select('userId name createdAt playerId');
};

// ========== دوال افتراضية ==========

playerSchema.virtual('requiredExp').get(function() {
    return (this.level || 1) * 100;
});

playerSchema.virtual('expProgress').get(function() {
    const exp = this.experience || 0;
    const required = this.requiredExp;
    return Math.floor((exp / required) * 100) || 0;
});

const Player = mongoose.model('Player', playerSchema);
export default Player;
