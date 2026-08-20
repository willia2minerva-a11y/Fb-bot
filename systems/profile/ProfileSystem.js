// systems/profile/ProfileSystem.js
import Player from '../../core/Player.js';
import { locations } from '../../data/locations.js'; 
import { items as ITEMS_DATA } from '../../data/items.js';
import { resources as RESOURCES_DATA } from '../../data/resources.js';

export class ProfileSystem {
    
    _getPlayerRank(level) {
        if (level >= 90) return 'SS';
        if (level >= 75) return 'S';
        if (level >= 60) return 'A';
        if (level >= 45) return 'B';
        if (level >= 30) return 'C';
        if (level >= 15) return 'D';
        return 'E';
    }

    // ✅ دالة ترجمة موحدة
    _translateItemName(itemId) {
        if (RESOURCES_DATA[itemId]?.name) return RESOURCES_DATA[itemId].name;
        if (ITEMS_DATA[itemId]?.name) return ITEMS_DATA[itemId].name;
        return itemId;
    }

    // دالة لعرض حالة اللاعب (Status) - تنسيق مُحسّن
    getPlayerStatus(player) {
        const actualStamina = player.getActualStamina();
        
        const expProgress = player.experience || 0;
        const requiredExp = (player.level || 1) * 100;
        const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
        
        const attackDamage = player.getAttackDamage(ITEMS_DATA);
        const defense = player.getDefense(ITEMS_DATA);
        const rank = this._getPlayerRank(player.level);
        
        const currentLocationId = player.currentLocation || 'forest';
        const currentLocationName = locations[currentLocationId] ? locations[currentLocationId].name : currentLocationId;
        
        const weaponName = this._translateItemName(player.equipment.weapon);
        const armorName = this._translateItemName(player.equipment.armor);
        const accessoryName = this._translateItemName(player.equipment.accessory);
        const toolName = this._translateItemName(player.equipment.tool);
        
        let statusMessage = `╔═════════════ 👤  ملف اللاعب: ${player.name} ════════════╗\n`;
        statusMessage += `\n📜 معلومات أساسية\n`;
        statusMessage += `├── المعرف (ID): ${player.playerId || 'N/A'}\n`;
        statusMessage += `├── المستوى: ${player.level}\n`;
        statusMessage += `├── 🌟 الرانك: ${rank}\n`;
        statusMessage += `└── 💰 الذهب: ${player.gold}\n`;

        statusMessage += `\n💪 الإحصائيات الحيوية\n`;
        statusMessage += `├── ❤️  الصحة: ${player.health}/${player.maxHealth}\n`;
        statusMessage += `├── ⚡  المانا: ${player.mana}/${player.maxMana}\n`;
        statusMessage += `└── 🏃  النشاط: ${Math.floor(actualStamina)}/${player.maxStamina}\n`;

        statusMessage += `\n⚔️ قوة القتال والمعدات\n`;
        statusMessage += `├── 🔥 الهجوم (بالمعدات): ${attackDamage}\n`;
        statusMessage += `├── 🛡️ الدفاع (بالمعدات): ${defense}\n`;
        statusMessage += `├── ⚔️ السلاح: ${weaponName}\n`;
        statusMessage += `├── 🛡️ الدرع: ${armorName}\n`;
        statusMessage += `├── 💍 إكسسوار: ${accessoryName}\n`;
        statusMessage += `└── ⛏️ الأداة: ${toolName}\n`;
        
        statusMessage += `\n📈 الخبرة\n`;
        statusMessage += `└── 💡  التقدم: ${expPercentage}% (${expProgress}/${requiredExp})\n`;

        statusMessage += `╚══════════════════════════════════════╝`;

        return statusMessage;
    }

    
    getPlayerInventory(player) {
        if (!player.inventory || player.inventory.length === 0) {
            return `🎒 حقيبة ${player.name}\n\nالحقيبة فارغة`;
        }
        
        let text = `🎒 حقيبة ${player.name}\n\n`;
        
        if (player.equipment) {
            text += `⚔️ المجهز حالياً:\n`;
            text += `• سلاح: ${this._translateItemName(player.equipment.weapon)}\n`;
            text += `• درع: ${this._translateItemName(player.equipment.armor)}\n`;
            text += `• إكسسوار: ${this._translateItemName(player.equipment.accessory)}\n`;
            text += `• أداة: ${this._translateItemName(player.equipment.tool)}\n`;
            text += `\n═══════════════════════════════════════\n`;
        }
        
        text += `📦 المخزون:\n`;
        player.inventory.forEach(item => {
            const displayName = this._translateItemName(item.id) || this._translateItemName(item.name) || item.name;
            text += `• ${displayName} ×${item.quantity}\n`;
        });
        
        return text;
    }
    
    getPlayerProfile(player) {
        const expProgress = player.experience || 0;
        const requiredExp = (player.level || 1) * 100;
        const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
        
        const monstersKilled = player.stats?.monstersKilled || 0;
        const questsCompleted = player.stats?.questsCompleted || 0;
        const resourcesGathered = player.stats?.resourcesGathered || 0;
        const battlesWon = player.stats?.battlesWon || 0;

        const weapon = this._translateItemName(player.equipment?.weapon);
        const armor = this._translateItemName(player.equipment?.armor);
        const accessory = this._translateItemName(player.equipment?.accessory);

        return `📋 بروفايل ${player.name}
────────────────
✨ المستوى: ${player.level} 
⭐ الخبرة: ${expProgress}/${requiredExp} (${expPercentage}%)
❤️ الصحة: ${player.health}/${player.maxHealth}
💰 الذهب: ${player.gold}
⚔️ السلاح: ${weapon}
🛡️ الدرع: ${armor}
💍 الإكسسوار: ${accessory}

🎯 الإحصائيات:
• ⚔️ المعارك: ${battlesWon} فوز
• 🐉 الوحوش: ${monstersKilled} قتيل
• 📜 المهام: ${questsCompleted} مكتمل
• 🌿 الموارد: ${resourcesGathered} مجمع

📍 الموقع الحالي: ${player.currentLocation || 'القرية'}`;
    }
    
    async changeName(player, args, senderId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        
        if (senderId !== ADMIN_PSID) {
            return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
        }

        let newName = args.join(' ').trim();
        
        if (!newName) {
            return 'يرجى تحديد اسم جديد. مثال: تغيير_اسم JohnDoe';
        }

        let targetPlayer = player;
        
        if (args.length > 1 && args[0].length > 10 && !isNaN(args[0])) { 
            const targetId = args[0];
            targetPlayer = await Player.findOne({ userId: targetId });
            
            if (!targetPlayer) {
                return `❌ لم يتم العثور على لاعب بالمعرف: ${targetId}`;
            }
            newName = args.slice(1).join(' ').trim();
        }

        if (!newName) {
            return 'يرجى تحديد اسم جديد بعد المعرف (إذا كنت تغير اسم لاعب آخر).';
        }

        if (newName.length < 3 || newName.length > 9) {
            return '❌ الاسم يجب أن يكون بين 3 إلى 9 أحرف.';
        }

        if (!/^[a-zA-Z]+$/.test(newName)) {
            return '❌ الاسم يجب أن يحتوي على أحرف إنجليزية فقط.';
        }

        const existingPlayer = await Player.findOne({ 
            name: new RegExp(`^${newName}$`, 'i'),
            userId: { $ne: targetPlayer.userId }
        });

        if (existingPlayer) {
            return '❌ هذا الاسم مستخدم مسبقاً. يرجى اختيار اسم آخر.';
        }

        const oldName = targetPlayer.name;
        targetPlayer.name = newName;

        await targetPlayer.save();

        console.log(`✅ تم تغيير اسم اللاعب ${oldName} إلى ${newName}`);
        
        return `✅ تم تحديث اسم اللاعب ${oldName} بنجاح إلى: ${newName}`;
    }
    }
