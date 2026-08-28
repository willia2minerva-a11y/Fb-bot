// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
import { items } from '../../data/items.js';
import { resources } from '../../data/resources.js';
import { AutoResponseSystem } from '../autoResponse/AutoResponseSystem.js';

export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
        this.autoResponseSystem = new AutoResponseSystem();
        console.log('👑 نظام المدير تم تهيئته');
    }

    /**
     * ✅ فحص إذا كان المستخدم مديراً (يدعم فيسبوك وتلغرام)
     */
    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;

        const adminIds = [
            ADMIN_PSID,
            ADMIN_TELEGRAM_ID ? `tg_${ADMIN_TELEGRAM_ID}` : null
        ].filter(Boolean);

        const isAdmin = adminIds.includes(userId);

        if (isAdmin) {
            console.log(`🎯 تم التعرف على المدير: ${userId}`);
        }

        return isAdmin;
    }

    generateUniqueId() {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ✅ ترجمة الندرة إلى العربية
    _translateRarity(rarity) {
        const rarityMap = {
            'common': 'عادي',
            'uncommon': 'غير عادي',
            'rare': 'نادر',
            'epic': 'ملحمي',
            'legendary': 'أسطوري',
            'mythic': 'خرافي',
            'divine': 'إلهي',
            'special': 'خاص'
        };
        return rarityMap[rarity] || rarity || 'عادي';
    }

    async setupAdminPlayer(userId, userName) {
        try {
            let player = await Player.findOne({ userId });

            if (!player) {
                player = await Player.createNew(userId, userName);
            }

            if (!player.playerId) {
                const lastId = await Player.getLastNumericId();
                player.playerId = (lastId + 1).toString();
            }

            player.registrationStatus = 'completed';
            player.gender = 'male';
            player.name = userName || 'المدير';
            player.level = 100;
            player.gold = 9999;
            player.health = 1000;
            player.maxHealth = 1000;
            player.mana = 500;
            player.maxMana = 500;
            player.stamina = 100;
            player.maxStamina = 100;

            await player.save();

            return player;
        } catch (error) {
            console.error('❌ خطأ في إعداد المدير:', error);
            throw error;
        }
    }

    getAdminCommands() {
        return {
            'موافقة_لاعب': 'موافقة لاعب',
            'تغيير_اسم': 'تغيير اسم',
            'تغيير_جنس': 'تغيير جنس',
            'حظر_لاعب': 'حظر لاعب',
            'اعادة_بيانات': 'اعادة بيانات',
            'اعطاء_ذهب': 'اعطاء ذهب',
            'اعطاء_مورد': 'اعطاء مورد',
            'زيادة_صحة': 'زيادة صحة',
            'زيادة_مانا': 'زيادة مانا',
            'اضف_رد': 'إضافة رد تلقائي',
            'ازل_رد': 'إزالة رد تلقائي',
            'عرض_الردود': 'عرض جميع الردود',
            'طلبات_سحب': 'عرض طلبات السحب',
            'معالجة_سحب': 'معالجة طلب سحب',
            'اضافة_غولد': 'إضافة غولد للاعب',
            'مدير': 'مدير',
            'عرض_اسلحة': 'عرض الأسلحة',
            'عرض_وحوش': 'عرض الوحوش',
            'عرض_مواقع': 'عرض المواقع',
            'عرض_موارد': 'عرض الموارد',
            'اضف_سلاح': 'إضافة سلاح',
            'حذف_سلاح': 'حذف سلاح',
            'اضف_وحش': 'إضافة وحش',
            'حذف_وحش': 'حذف وحش',
            'اضف_مورد': 'إضافة مورد',
            'حذف_مورد': 'حذف مورد'
        };
    }

    getAdminHelp() {
        return `👑 أوامر المدير

🛠️ الإدارة
• تغيير_اسم [ID] [الاسم]
• اعادة_بيانات [ID]
• حظر_لاعب [ID] [صحيح/خطأ]
• تغيير_جنس [ID] [ذكر/أنثى]
• موافقة_لاعب [ID]

💰 الاقتصاد
• طلبات_سحب
• معالجة_سحب [ID] [قبول/رفض]
• اضافة_غولد [ID] [المبلغ]

🤖 الردود
• اضف_رد [الكلمة] || [الرد]
• ازل_رد [الكلمة]
• عرض_الردود

🎁 المنح
• اعطاء_ذهب [ID] [الكمية]
• اعطاء_مورد [ID] [العنصر] [الكمية]
• زيادة_صحة [ID] [الكمية]
• زيادة_مانا [ID] [الكمية]

📋 العرض (مع صفحات)
• عرض_اسلحة [الصفحة]
• عرض_وحوش [الصفحة]
• عرض_مواقع [الصفحة]
• عرض_موارد [الصفحة]

➕ الإضافة والحذف
• اضف_سلاح [اسم] [قوة] [مستوى]
• حذف_سلاح [اسم_السلاح]
• اضف_وحش [اسم] [صحة] [ضرر] [مستوى]
• حذف_وحش [اسم_الوحش]
• اضف_مورد [اسم] [ندرة] [موقع]
• حذف_مورد [اسم_المورد]`;
    }

    async handleAdminCommand(command, args, senderId, player, itemMap) {
        const findTargetPlayer = async (id) => {
            if (!id) return null;

            console.log(`🔍 البحث عن لاعب بالمعرف: "${id}"`);

            const cleanId = id.trim().toUpperCase();

            // 1. البحث بـ userId
            let targetPlayer = await Player.findOne({
                userId: { $regex: new RegExp('^' + id + '$', 'i') }
            });
            if (targetPlayer) return targetPlayer;

            // 2. البحث بـ playerId
            let playerIdToSearch = cleanId;
            if (!playerIdToSearch.startsWith('P') && /^\d+$/.test(playerIdToSearch)) {
                playerIdToSearch = 'P' + playerIdToSearch;
            }

            targetPlayer = await Player.findOne({
                playerId: { $regex: new RegExp('^' + playerIdToSearch + '$', 'i') }
            });
            if (targetPlayer) return targetPlayer;

            // 3. البحث بالاسم
            targetPlayer = await Player.findOne({
                name: { $regex: new RegExp(id, 'i') }
            });
            if (targetPlayer) return targetPlayer;

            return null;
        };

        switch (command) {
            case 'مدير': return this.getAdminHelp();
            case 'موافقة_لاعب': return await this.handleApprovePlayer(args, senderId);
            case 'اعادة_بيانات': return await this.handleResetPlayer(args, findTargetPlayer);
            case 'تغيير_اسم': return await this.handleSetPlayerName(args, findTargetPlayer);
            case 'تغيير_جنس': return await this.handleSetPlayerGender(args, findTargetPlayer);
            case 'حظر_لاعب': return await this.handleBanPlayer(args, findTargetPlayer);
            case 'اعطاء_ذهب': return await this.handleGiveGold(args, findTargetPlayer);
            case 'اعطاء_مورد': return await this.handleGiveItem(args, findTargetPlayer, itemMap);
            case 'زيادة_صحة': return await this.handleIncreaseStat(args, 'maxHealth', findTargetPlayer);
            case 'زيادة_مانا': return await this.handleIncreaseStat(args, 'maxMana', findTargetPlayer);
            case 'طلبات_سحب': return await this.handlePendingWithdrawals(args, senderId);
            case 'معالجة_سحب': return await this.handleProcessWithdrawal(args, senderId);
            case 'اضافة_غولد': return await this.handleAddGold(args, senderId);
            case 'اضف_رد': return await this.handleAddAutoResponse(args, senderId);
            case 'ازل_رد': return await this.handleRemoveAutoResponse(args, senderId);
            case 'عرض_الردود': return await this.handleShowAutoResponses(args, senderId);
            case 'عرض_اسلحة': return await this.handleShowItemsByType(args, 'weapon');
            case 'عرض_وحوش': return await this.handleShowMonsters(args);
            case 'عرض_مواقع': return await this.handleShowLocations(args);
            case 'عرض_موارد': return await this.handleShowResources(args);
            case 'اضف_سلاح': return await this.handleAddWeapon(args);
            case 'حذف_سلاح': return await this.handleDeleteWeapon(args);
            case 'اضف_وحش': return await this.handleAddMonster(args);
            case 'حذف_وحش': return await this.handleDeleteMonster(args);
            case 'اضف_مورد': return await this.handleAddResource(args);
            case 'حذف_مورد': return await this.handleDeleteResource(args);
            default: return '❌ أمر مدير غير معروف';
        }
    }

    // ===================================
    // أوامر العرض مع الصفحات
    // ===================================

    async handleShowItemsByType(args, type) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;

        const itemsList = Object.entries(items).filter(([id, item]) => item.type === type);
        const totalPages = Math.ceil(itemsList.length / perPage);

        if (totalPages === 0) return `❌ لا توجد عناصر من نوع ${type}`;
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي الصفحات: ${totalPages}`;

        const start = (page - 1) * perPage;
        const pageItems = itemsList.slice(start, start + perPage);

        let message = `📋 ${type} - صفحة ${page}/${totalPages}\n\n`;
        pageItems.forEach(([id, item]) => {
            message += `• ${item.name} (${id})\n`;
            message += `  المستوى: ${item.level || 1}\n`;
            if (item.attack) message += `  الهجوم: ${item.attack}\n`;
            if (item.defense) message += `  الدفاع: ${item.defense}\n`;
            if (item.rarity) message += `  الندرة: ${this._translateRarity(item.rarity)}\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_اسلحة [رقم]`;
        return message;
    }

    async handleShowMonsters(args) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;

        const { monsters } = await import('../../data/monsters.js');
        const monstersList = Object.entries(monsters);
        const totalPages = Math.ceil(monstersList.length / perPage);

        if (totalPages === 0) return '❌ لا توجد وحوش';
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي الصفحات: ${totalPages}`;

        const start = (page - 1) * perPage;
        const pageMonsters = monstersList.slice(start, start + perPage);

        let message = `👹 الوحوش - صفحة ${page}/${totalPages}\n\n`;
        pageMonsters.forEach(([id, monster]) => {
            message += `• ${monster.name} (${id})\n`;
            message += `  المستوى: ${monster.level || 1}\n`;
            message += `  الصحة: ${monster.health || monster.maxHealth || 0}\n`;
            message += `  الضرر: ${monster.damage || 0}\n`;
            if (monster.isBoss) message += `  👑 زعيم\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_وحوش [رقم]`;
        return message;
    }

    async handleShowLocations(args) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;

        const { locations } = await import('../../data/locations.js');
        const locationsList = Object.entries(locations);
        const totalPages = Math.ceil(locationsList.length / perPage);

        if (totalPages === 0) return '❌ لا توجد مواقع';
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي الصفحات: ${totalPages}`;

        const start = (page - 1) * perPage;
        const pageLocations = locationsList.slice(start, start + perPage);

        let message = `📍 المواقع - صفحة ${page}/${totalPages}\n\n`;
        pageLocations.forEach(([id, location]) => {
            message += `• ${location.name || id} (${id})\n`;
            if (location.monsters) message += `  الوحوش: ${location.monsters.length}\n`;
            if (location.resources) message += `  الموارد: ${location.resources.length}\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_مواقع [رقم]`;
        return message;
    }

    async handleShowResources(args) {
        const page = parseInt(args[0]) || 1;
        const perPage = 10;

        const { resources } = await import('../../data/resources.js');
        const resourcesList = Object.entries(resources);
        const totalPages = Math.ceil(resourcesList.length / perPage);

        if (totalPages === 0) return '❌ لا توجد موارد';
        if (page < 1 || page > totalPages) return `❌ الصفحة ${page} غير موجودة. إجمالي الصفحات: ${totalPages}`;

        const start = (page - 1) * perPage;
        const pageResources = resourcesList.slice(start, start + perPage);

        let message = `🌿 الموارد - صفحة ${page}/${totalPages}\n\n`;
        pageResources.forEach(([id, resource]) => {
            message += `• ${resource.name} (${id})\n`;
            message += `  الندرة: ${this._translateRarity(resource.rarity || 'common')}\n`;
            if (resource.locations) message += `  المواقع: ${resource.locations.length}\n`;
            message += `\n`;
        });

        message += `📄 للتنقل: عرض_موارد [رقم]`;
        return message;
    }

    // ===================================
    // أوامر الإضافة والحذف
    // ===================================

    async handleAddWeapon(args) {
        if (args.length < 3) return '❌ الاستخدام: اضف_سلاح [اسم] [قوة] [مستوى]';
        const name = args.slice(0, -2).join(' ');
        const attack = parseInt(args[args.length - 2]);
        const level = parseInt(args[args.length - 1]);
        if (isNaN(attack) || isNaN(level)) return '❌ القوة والمستوى يجب أن يكونا أرقامًا';

        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Weapon } = await import('../../core/models/Weapon.js');
            await Weapon.updateOne(
                { id },
                { $set: { id, name, type: 'weapon', attack, level, rarity: 'common' } },
                { upsert: true }
            );
            return `✅ تمت إضافة السلاح ${name} بنجاح`;
        } catch (e) {
            return '❌ فشل الإضافة: ' + e.message;
        }
    }

    async handleDeleteWeapon(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Weapon } = await import('../../core/models/Weapon.js');
            await Weapon.deleteOne({ id });
            return `✅ تم حذف السلاح ${name}`;
        } catch (e) {
            return '❌ فشل الحذف: ' + e.message;
        }
    }

    async handleAddMonster(args) {
        if (args.length < 4) return '❌ الاستخدام: اضف_وحش [اسم] [صحة] [ضرر] [مستوى]';
        const name = args.slice(0, -3).join(' ');
        const health = parseInt(args[args.length - 3]);
        const damage = parseInt(args[args.length - 2]);
        const level = parseInt(args[args.length - 1]);
        if ([health, damage, level].some(isNaN)) return '❌ الأرقام غير صالحة';

        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Monster } = await import('../../core/models/Monster.js');
            await Monster.updateOne(
                { id },
                { $set: { id, name, level, health, maxHealth: health, damage } },
                { upsert: true }
            );
            return `✅ تمت إضافة الوحش ${name}`;
        } catch (e) {
            return '❌ فشل الإضافة: ' + e.message;
        }
    }

    async handleDeleteMonster(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Monster } = await import('../../core/models/Monster.js');
            await Monster.deleteOne({ id });
            return `✅ تم حذف الوحش ${name}`;
        } catch (e) {
            return '❌ فشل الحذف: ' + e.message;
        }
    }

    async handleAddResource(args) {
        if (args.length < 3) return '❌ الاستخدام: اضف_مورد [اسم] [ندرة] [موقع]';
        const name = args.slice(0, -2).join(' ');
        const rarity = args[args.length - 2];
        const location = args[args.length - 1];
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Resource } = await import('../../core/models/Resource.js');
            await Resource.updateOne(
                { id },
                { $set: { id, name, rarity, locations: [location] } },
                { upsert: true }
            );
            return `✅ تمت إضافة المورد ${name}`;
        } catch (e) {
            return '❌ فشل الإضافة: ' + e.message;
        }
    }

    async handleDeleteResource(args) {
        const name = args.join(' ');
        const id = name.toLowerCase().replace(/\s+/g, '_');
        try {
            const { Resource } = await import('../../core/models/Resource.js');
            await Resource.deleteOne({ id });
            return `✅ تم حذف المورد ${name}`;
        } catch (e) {
            return '❌ فشل الحذف: ' + e.message;
        }
    }

    // ===================================
    // أوامر الإدارة الأساسية
    // ===================================

    async handleResetPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        if (!targetId) return '❌ الاستخدام: اعادة_بيانات [UserID/PlayerID]';

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const oldName = targetPlayer.name;
        await targetPlayer.deleteOne();
        await Player.createNew(targetPlayer.userId, targetPlayer.name);

        return `🗑️ تم مسح وإعادة تعيين بيانات اللاعب ${oldName} بنجاح.`;
    }

    async handleSetPlayerName(args, findTargetPlayer) {
        const targetId = args[0];
        const newName = args.slice(1).join(' ');

        if (!targetId || !newName) return '❌ الاستخدام: تغيير_اسم [UserID/PlayerID] [الاسم الجديد]';

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const existingPlayer = await Player.findOne({ name: newName, userId: { $ne: targetPlayer.userId } });
        if (existingPlayer) return `❌ الاسم ${newName} مستخدم بالفعل.`;

        const oldName = targetPlayer.name;
        targetPlayer.name = newName;
        await targetPlayer.save();

        return `✅ تم تغيير اسم اللاعب من ${oldName} إلى ${newName}.`;
    }

    async handleSetPlayerGender(args, findTargetPlayer) {
        const targetId = args[0];
        const newGenderRaw = args[1] ? args[1].toLowerCase() : null;

        if (!targetId || !['ذكر', 'أنثى', 'male', 'female'].includes(newGenderRaw)) {
            return '❌ الاستخدام: تغيير_جنس [UserID/PlayerID] [ذكر/أنثى]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const genderCode = (newGenderRaw === 'ذكر' || newGenderRaw === 'male') ? 'male' : 'female';
        targetPlayer.gender = genderCode;
        await targetPlayer.save();

        return `✅ تم تغيير جنس اللاعب ${targetPlayer.name} إلى ${genderCode === 'male' ? 'ذكر' : 'أنثى'}.`;
    }

    async handleBanPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        const banStatusRaw = args[1] ? args[1].toLowerCase() : 'true';

        if (!targetId) return '❌ الاستخدام: حظر_لاعب [UserID/PlayerID] [true/false]';

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        const isBanning = banStatusRaw === 'true' || banStatusRaw === 'حظر';
        targetPlayer.banned = isBanning;
        await targetPlayer.save();

        return `✅ تم ${isBanning ? 'حظر' : 'رفع الحظر عن'} اللاعب ${targetPlayer.name}.`;
    }

    async handleApprovePlayer(args, senderId) {
        const RegistrationSystem = (await import('../registration/RegistrationSystem.js')).RegistrationSystem;
        const registrationSystem = new RegistrationSystem();

        if (args.length === 0) {
            const pendingPlayers = await registrationSystem.getPendingPlayers();
            if (pendingPlayers.length === 0) return '✅ لا يوجد لاعبين بانتظار الموافقة.';

            let message = '⏳ اللاعبين المنتظرين للموافقة:\n\n';
            pendingPlayers.forEach((p, index) => {
                message += `${index + 1}. ${p.name} - ${p.userId}\n`;
            });
            message += '\nللموافقة: موافقة_لاعب [المعرف]';
            return message;
        }

        const targetUserId = args[0];
        return await registrationSystem.approvePlayer(targetUserId, senderId);
    }

    async handleGiveItem(args, findTargetPlayer, itemMap) {
        if (args.length < 3) return '❌ الاستخدام: اعطاء_مورد [ID] [اسم_العنصر] [الكمية]';

        const targetId = args[0];
        const quantity = parseInt(args[args.length - 1], 10);
        const rawItemName = args.slice(1, args.length - 1).join(' ').toLowerCase();

        const itemId = itemMap[rawItemName] || rawItemName;
        const itemInfo = items[itemId];

        if (!itemInfo || isNaN(quantity) || quantity <= 0) {
            return '❌ العنصر غير موجود أو الكمية غير صالحة.';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        targetPlayer.addItem(itemInfo.id, itemInfo.name, itemInfo.type, quantity);
        await targetPlayer.save();

        return `✅ تم إضافة ${quantity} × ${itemInfo.name} للاعب ${targetPlayer.name}.`;
    }

    async handleIncreaseStat(args, statToChange, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) {
            return `❌ الاستخدام: زيادة_${statToChange === 'maxHealth' ? 'صحة' : 'مانا'} [ID] [الكمية]`;
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        if (statToChange === 'maxHealth') {
            targetPlayer.maxHealth += amount;
            targetPlayer.health += amount;
        } else {
            targetPlayer.maxMana += amount;
            targetPlayer.mana += amount;
        }

        await targetPlayer.save();
        return `✅ تم زيادة ${statToChange === 'maxHealth' ? 'الصحة' : 'المانا'} للاعب ${targetPlayer.name} بمقدار ${amount}.`;
    }

    async handleGiveGold(args, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) return '❌ الاستخدام: اعطاء_ذهب [ID] [الكمية]';

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) return `❌ لم يتم العثور على اللاعب ${targetId}.`;

        targetPlayer.addGold(amount);
        await targetPlayer.save();

        return `✅ تم إعطاء ${targetPlayer.name} مبلغ ${amount} غولد.`;
    }

    // ===================================
    // النظام الاقتصادي
    // ===================================

    async handlePendingWithdrawals(args, senderId) {
        if (!this.isAdmin(senderId)) return '❌ هذا الأمر خاص بالمدراء فقط.';
        try {
            const pendingPlayers = await Player.find({ 'pendingWithdrawal.status': 'pending' });
            if (pendingPlayers.length === 0) return '📭 لا توجد طلبات سحب معلقة.';
            let msg = `📋 طلبات السحب المعلقة (${pendingPlayers.length}):\n\n`;
            pendingPlayers.forEach(p => {
                msg += `• ${p.name} (${p.userId}): ${p.pendingWithdrawal.amount} غولد\n`;
            });
            return msg;
        } catch (error) {
            console.error('Error fetching pending withdrawals:', error);
            return '❌ حدث خطأ أثناء جلب طلبات السحب.';
        }
    }

    async handleProcessWithdrawal(args, senderId) {
        if (!this.isAdmin(senderId)) return '❌ هذا الأمر خاص بالمدراء فقط.';
        if (args.length < 2) return '❌ الاستخدام: معالجة_سحب [player_id] [قبول/رفض]';

        const targetId = args[0];
        const action = args[1].toLowerCase();
        try {
            const targetPlayer = await Player.findOne({ userId: targetId }) || 
                                 await Player.findOne({ playerId: targetId }) || 
                                 await Player.findOne({ name: new RegExp(targetId, 'i') });
            if (!targetPlayer) return `❌ اللاعب غير موجود: ${targetId}`;
            if (targetPlayer.pendingWithdrawal?.status !== 'pending') return '❌ لا يوجد طلب سحب معلق.';

            const amount = targetPlayer.pendingWithdrawal.amount;
            if (action === 'قبول' || action === 'موافقة') {
                targetPlayer.pendingWithdrawal.status = 'completed';
                await targetPlayer.save();
                return `✅ تم قبول طلب سحب ${targetPlayer.name} بمبلغ ${amount} غولد.`;
            } else if (action === 'رفض') {
                targetPlayer.gold += amount;
                targetPlayer.pendingWithdrawal.status = 'rejected';
                await targetPlayer.save();
                return `❌ تم رفض الطلب وإعادة ${amount} غولد إلى ${targetPlayer.name}.`;
            } else {
                return '❌ استخدم قبول أو رفض.';
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            return '❌ حدث خطأ أثناء معالجة السحب.';
        }
    }

    async handleAddGold(args, senderId) {
        if (!this.isAdmin(senderId)) return '❌ هذا الأمر خاص بالمدراء فقط.';
        if (args.length < 2) return '❌ الاستخدام: اضافة_غولد [player_id] [amount]';
        const targetId = args[0];
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) return '❌ مبلغ غير صالح.';
        try {
            const targetPlayer = await Player.findOne({ userId: targetId }) || 
                                 await Player.findOne({ playerId: targetId }) || 
                                 await Player.findOne({ name: new RegExp(targetId, 'i') });
            if (!targetPlayer) return '❌ اللاعب غير موجود.';
            targetPlayer.gold += amount;
            targetPlayer.transactions.push({
                id: this.generateUniqueId(),
                type: 'deposit',
                amount,
                status: 'completed',
                description: 'إيداع من المدير'
            });
            await targetPlayer.save();
            return `✅ تمت إضافة ${amount} غولد إلى ${targetPlayer.name}.`;
        } catch (error) {
            console.error('Error adding gold:', error);
            return '❌ حدث خطأ.';
        }
    }

    // ===================================
    // الردود التلقائية
    // ===================================

    async handleAddAutoResponse(args, senderId) {
        if (!this.isAdmin(senderId)) return '❌ هذا الأمر خاص بالمدراء فقط.';
        const input = args.join(' ');
        const parts = input.split('||');
        if (parts.length < 2) return '❌ الاستخدام: اضف_رد [الكلمة] || [الرد]';
        const keyword = parts[0].trim().toLowerCase();
        const response = parts.slice(1).join('||').trim();
        if (!keyword || !response) return '❌ يجب تحديد الكلمة والرد.';
        this.autoResponseSystem.addResponse(keyword, response);
        return `✅ تم إضافة رد تلقائي للكلمة "${keyword}".`;
    }

    async handleRemoveAutoResponse(args, senderId) {
        if (!this.isAdmin(senderId)) return '❌ هذا الأمر خاص بالمدراء فقط.';
        const keyword = args.join(' ').toLowerCase().trim();
        if (!keyword) return '❌ الاستخدام: ازل_رد [الكلمة]';
        const removed = this.autoResponseSystem.removeResponse(keyword);
        return removed ? `✅ تم حذف الرد "${keyword}".` : `❌ لا يوجد رد للكلمة "${keyword}".`;
    }

    async handleShowAutoResponses(args, senderId) {
        if (!this.isAdmin(senderId)) return '❌ هذا الأمر خاص بالمدراء فقط.';
        const all = this.autoResponseSystem.getAllResponses();
        const keys = Object.keys(all);
        if (keys.length === 0) return '📝 لا توجد ردود تلقائية.';
        let msg = `🤖 الردود التلقائية (${keys.length}):\n\n`;
        for (const key of keys) {
            msg += `• ${key}: ${all[key]}\n`;
        }
        return msg;
    }

    findAutoResponse(message) {
        return this.autoResponseSystem.findAutoResponse(message);
    }
                }
