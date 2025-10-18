// Player.js
import mongoose from 'mongoose';
// 💡 ملاحظة: يجب تعديل هذا المسار ليناسب بنية مشروعك الفعلية، نفترض أنه داخل مجلد 'models'
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
    health: { type: Number, default: 100, min: 0 },
    maxHealth: { type: Number, default: 100, min: 1 },
    mana: { type: Number, default: 50, min: 0 },
    maxMana: { type: Number, default: 50, min: 0 },
    stamina: { type: Number, default: 100, min: 0 },
    maxStamina: { type: Number, default: 100, min: 1 },
    lastStaminaAction: { type: Date, default: Date.now },
    currentLocation: { type: String, default: 'forest' },
    inventory: [inventoryItemSchema],
    skills: { gathering: { type: Number, default: 1, min: 1 }, combat: { type: Number, default: 1, min: 1 }, crafting: { type: Number, default: 1, min: 1 } },
    equipment: { weapon: { type: String, default: null }, armor: { type: String, default: null }, accessory: { type: String, default: null }, tool: { type: String, default: null } },
    stats: {
        battlesWon: { type: Number, default: 0, min: 0 },
        battlesLost: { type: Number, default: 0, min: 0 },
        monstersKilled: { type: Number, default: 0, min: 0 },
        questsCompleted: { type: Number, default: 0, min: 0 },
        resourcesGathered: { type: Number, default: 0, min: 0 },
        itemsCrafted: { type: Number, default: 0, min: 0 }
    },
    lastAction: { type: Date, default: Date.now },
    cooldowns: { gather: { type: Date, default: null }, battle: { type: Date, default: null }, craft: { type: Date, default: null } },
    banned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

playerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    // 💡 إعادة حساب الخصائص القصوى قبل الحفظ لضمان التناسق
    this.recalculateMaxStats(this.getEquippedItemStats(global.itemsData));
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
    // 💡 استخدام الإحصائيات القصوى المُعاد حسابها
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

// 🆕 دالة مساعدة لجلب إحصائيات كل المعدات المجهزة
playerSchema.methods.getEquippedItemStats = function(itemsData) {
    const totalStats = {
        damage: 0,
        defense: 0,
        maxHealth: 0,
        maxMana: 0,
        maxStamina: 0,
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
        return { error: `❌ النوع "${itemType}" لا يمكن تجهيزه في خانة معدات.`; }
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
    
    const baseDamage = 10 + ((this.level || 1) - 1) * 2;
    const multiplier = (this.skills && this.skills.combat) || 1;
    
    // استخدام الدالة المساعدة
    const equippedDamage = this.getEquippedItemStats(itemsData).damage;

    return Math.floor((baseDamage + equippedDamage) * multiplier);
};

/**
 * 🛠️ دالة حساب قوة الدفاع الإجمالية (مصححة)
 */
playerSchema.methods.getDefense = function(itemsData) {
    // 💡 الإصلاح: التحقق من itemsData وإرجاع القيمة الأساسية لتفادي الانهيار
    if (!itemsData) { return 5 + ((this.level || 1) - 1) * 1; }
    
    const baseDefense = 5 + ((this.level || 1) - 1) * 1;
    const multiplier = (this.skills && this.skills.combat) || 1;
    
    // استخدام الدالة المساعدة
    const equippedDefense = this.getEquippedItemStats(itemsData).defense;

    return Math.floor((baseDefense + equippedDefense) * multiplier);
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
