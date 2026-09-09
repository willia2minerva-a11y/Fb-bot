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

    _translateItemName(itemId) {
        if (!itemId || itemId === 'null' || itemId === 'undefined') return 'لا يوجد';
        if (RESOURCES_DATA[itemId]?.name) return RESOURCES_DATA[itemId].name;
        if (ITEMS_DATA[itemId]?.name) return ITEMS_DATA[itemId].name;
        return itemId;
    }

    _getLocationName(locationId) {
        if (!locationId) return 'الغابة';
        return locations[locationId]?.name || locationId;
    }

    getPlayerStatus(player) {
        const actualStamina = player.getActualStamina();
        const expProgress = player.experience || 0;
        const requiredExp = (player.level || 1) * 100;
        const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;

        const attackDamage = player.getAttackDamage(ITEMS_DATA);
        const defense = player.getDefense(ITEMS_DATA);
        const rank = this._getPlayerRank(player.level);
        const locationName = this._getLocationName(player.currentLocation);

        return `👤 ملف اللاعب: ${player.name}

📜 معلومات أساسية
• المعرف: ${player.playerId || 'غير محدد'}
• المستوى: ${player.level}
• الرانك: ${rank}
• الذهب: ${player.gold}
• الموقع: ${locationName}

💪 الإحصائيات
• الصحة: ${player.health}/${player.maxHealth}
• المانا: ${player.mana}/${player.maxMana}
• النشاط: ${Math.floor(actualStamina)}/${player.maxStamina}

⚔️ القتال والمعدات
• الهجوم: ${attackDamage}
• الدفاع: ${defense}
• السلاح: ${this._translateItemName(player.equipment.weapon)}
• الدرع: ${this._translateItemName(player.equipment.armor)}
• الإكسسوار: ${this._translateItemName(player.equipment.accessory)}
• الأداة: ${this._translateItemName(player.equipment.tool)}

📈 الخبرة
• التقدم: ${expPercentage}% (${expProgress}/${requiredExp})`;
    }

    getPlayerInventory(player) {
        if (!player.inventory || player.inventory.length === 0) {
            return `🎒 حقيبة ${player.name}

الحقيبة فارغة`;
        }

        let text = `🎒 حقيبة ${player.name}\n\n`;

        if (player.equipment) {
            text += `⚔️ المجهز حالياً:\n`;
            text += `• سلاح: ${this._translateItemName(player.equipment.weapon)}\n`;
            text += `• درع: ${this._translateItemName(player.equipment.armor)}\n`;
            text += `• إكسسوار: ${this._translateItemName(player.equipment.accessory)}\n`;
            text += `• أداة: ${this._translateItemName(player.equipment.tool)}\n\n`;
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

        return `📋 بروفايل ${player.name}

✨ المستوى: ${player.level}
⭐ الخبرة: ${expProgress}/${requiredExp} (${expPercentage}%)
❤️ الصحة: ${player.health}/${player.maxHealth}
💰 الذهب: ${player.gold}
📍 الموقع: ${this._getLocationName(player.currentLocation)}

⚔️ المعدات:
• السلاح: ${this._translateItemName(player.equipment?.weapon)}
• الدرع: ${this._translateItemName(player.equipment?.armor)}
• الإكسسوار: ${this._translateItemName(player.equipment?.accessory)}

🎯 الإحصائيات:
• المعارك: ${player.stats?.battlesWon || 0} فوز
• الوحوش: ${player.stats?.monstersKilled || 0} قتيل
• المهام: ${player.stats?.questsCompleted || 0} مكتمل
• الموارد: ${player.stats?.resourcesGathered || 0} مجمع`;
    }

    async changeName(player, args, senderId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;

        if (senderId !== ADMIN_PSID) {
            return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
        }

        let newName = args.join(' ').trim();

        if (!newName) {
            return '❌ اكتب الاسم الجديد. مثال: تغيير_اسم JohnDoe';
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
            return '❌ اكتب الاسم الجديد بعد المعرف.';
        }

        if (newName.length < 3 || newName.length > 9) {
            return '❌ الاسم يجب أن يكون بين 3 و 9 أحرف.';
        }

        if (!/^[a-zA-Z]+$/.test(newName)) {
            return '❌ الاسم إنجليزي فقط.';
        }

        const existingPlayer = await Player.findOne({
            name: new RegExp(`^${newName}$`, 'i'),
            userId: { $ne: targetPlayer.userId }
        });

        if (existingPlayer) {
            return '❌ هذا الاسم مستخدم. اختر اسماً آخر.';
        }

        const oldName = targetPlayer.name;
        targetPlayer.name = newName;
        await targetPlayer.save();

        return `✅ تم تغيير الاسم من ${oldName} إلى ${newName}`;
    }
            }
