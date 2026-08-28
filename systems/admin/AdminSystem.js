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
     * @param {string} userId - معرف المستخدم
     * @returns {boolean}
     */
    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;

        // ✅ قائمة معرفات المديرين (فيسبوك وتلغرام)
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
            'عرض_موارد': 'عرض الموارد'
        };
    }

    getAdminHelp() {
        return `👑 أوامر المدير

🛠️ الإدارة والتحكم
• تغيير_اسم [ID] [الاسم]: تغيير اسم اللاعب
• اعادة_بيانات [ID]: إعادة تعيين بيانات اللاعب
• حظر_لاعب [ID] [صحيح/خطأ]: حظر أو رفع الحظر
• تغيير_جنس [ID] [ذكر/أنثى]: تغيير جنس اللاعب
• موافقة_لاعب [ID]: الموافقة على لاعب

💰 النظام الاقتصادي
• طلبات_سحب: عرض طلبات السحب المعلقة
• معالجة_سحب [ID] [قبول/رفض]: معالجة طلب سحب
• اضافة_غولد [ID] [المبلغ]: إضافة غولد

🤖 الردود التلقائية
• اضف_رد [الكلمة] || [الرد]: إضافة رد
• ازل_رد [الكلمة]: إزالة رد
• عرض_الردود: عرض جميع الردود

🎁 المنح
• اعطاء_ذهب [ID] [الكمية]: منح ذهب
• اعطاء_مورد [ID] [العنصر] [الكمية]: منح عنصر
• زيادة_صحة [ID] [الكمية]: زيادة الصحة
• زيادة_مانا [ID] [الكمية]: زيادة المانا

📋 العرض
• عرض_اسلحة: عرض جميع الأسلحة
• عرض_وحوش: عرض جميع الوحوش
• عرض_مواقع: عرض جميع المواقع
• عرض_موارد: عرض جميع الموارد`;
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
            if (targetPlayer) {
                console.log(`✅ تم العثور بالـ userId: ${targetPlayer.name}`);
                return targetPlayer;
            }

            // 2. البحث بـ playerId
            let playerIdToSearch = cleanId;
            if (!playerIdToSearch.startsWith('P') && /^\d+$/.test(playerIdToSearch)) {
                playerIdToSearch = 'P' + playerIdToSearch;
            }

            targetPlayer = await Player.findOne({
                playerId: { $regex: new RegExp('^' + playerIdToSearch + '$', 'i') }
            });
            if (targetPlayer) {
                console.log(`✅ تم العثور بالـ playerId: ${targetPlayer.name}`);
                return targetPlayer;
            }

            // 3. البحث بالاسم
            targetPlayer = await Player.findOne({
                name: { $regex: new RegExp(id, 'i') }
            });
            if (targetPlayer) {
                console.log(`✅ تم العثور بالاسم: ${targetPlayer.name}`);
                return targetPlayer;
            }

            console.log(`❌ لم يتم العثور على اللاعب: "${id}"`);
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
            default: return '❌ أمر مدير غير معروف';
        }
    }

    // ===================================
    // أوامر العرض الجديدة
    // ===================================

    async handleShowItemsByType(args, type) {
        try {
            const itemsList = Object.entries(items).filter(([id, item]) => item.type === type);
            if (itemsList.length === 0) return `❌ لا توجد عناصر من نوع ${type}`;

            let message = `📋 عناصر من نوع ${type} (${itemsList.length}):\n\n`;
            itemsList.forEach(([id, item], index) => {
                message += `• ${item.name} (${id})\n`;
                message += `  المستوى: ${item.level || 1}\n`;
                if (item.attack) message += `  الهجوم: ${item.attack}\n`;
                if (item.defense) message += `  الدفاع: ${item.defense}\n`;
                if (item.rarity) message += `  الندرة: ${item.rarity}\n`;
                message += `\n`;
            });

            return message;
        } catch (error) {
            console.error('❌ خطأ في عرض العناصر:', error);
            return '❌ حدث خطأ في عرض العناصر.';
        }
    }

    async handleShowMonsters(args) {
        try {
            const { monsters } = await import('../../data/monsters.js');
            const monstersList = Object.entries(monsters);
            if (monstersList.length === 0) return '❌ لا توجد وحوش';

            let message = `👹 جميع الوحوش (${monstersList.length}):\n\n`;
            monstersList.forEach(([id, monster], index) => {
                message += `• ${monster.name} (${id})\n`;
                message += `  المستوى: ${monster.level || 1}\n`;
                message += `  الصحة: ${monster.health || monster.maxHealth || 0}\n`;
                message += `  الضرر: ${monster.damage || 0}\n`;
                if (monster.isBoss) message += `  👑 زعيم\n`;
                message += `\n`;
            });

            return message;
        } catch (error) {
            console.error('❌ خطأ في عرض الوحوش:', error);
            return '❌ حدث خطأ في عرض الوحوش.';
        }
    }

    async handleShowLocations(args) {
        try {
            const { locations } = await import('../../data/locations.js');
            const locationsList = Object.entries(locations);
            if (locationsList.length === 0) return '❌ لا توجد مواقع';

            let message = `📍 جميع المواقع (${locationsList.length}):\n\n`;
            locationsList.forEach(([id, location], index) => {
                message += `• ${location.name || id} (${id})\n`;
                if (location.monsters) message += `  الوحوش: ${location.monsters.length}\n`;
                if (location.resources) message += `  الموارد: ${location.resources.length}\n`;
                message += `\n`;
            });

            return message;
        } catch (error) {
            console.error('❌ خطأ في عرض المواقع:', error);
            return '❌ حدث خطأ في عرض المواقع.';
        }
    }

    async handleShowResources(args) {
        try {
            const { resources } = await import('../../data/resources.js');
            const resourcesList = Object.entries(resources);
            if (resourcesList.length === 0) return '❌ لا توجد موارد';

            let message = `🌿 جميع الموارد (${resourcesList.length}):\n\n`;
            resourcesList.forEach(([id, resource], index) => {
                message += `• ${resource.name} (${id})\n`;
                message += `  الندرة: ${resource.rarity || 'عادي'}\n`;
                if (resource.locations) message += `  المواقع: ${resource.locations.length}\n`;
                message += `\n`;
            });

            return message;
        } catch (error) {
            console.error('❌ خطأ في عرض الموارد:', error);
            return '❌ حدث خطأ في عرض الموارد.';
        }
    }

    // ===================================
    // أوامر الإدارة الأساسية
    // ===================================

    async handleResetPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        if (!targetId) {
            return '❌ الاستخدام: اعادة_بيانات [UserID/PlayerID]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }

        const oldName = targetPlayer.name;
        await targetPlayer.deleteOne();
        await Player.createNew(targetPlayer.userId, targetPlayer.name);

        return `🗑️ تم مسح وإعادة تعيين بيانات اللاعب ${oldName} بنجاح.`;
    }

    async handleSetPlayerName(args, findTargetPlayer) {
        const targetId = args[0];
        const newName = args.slice(1).join(' ');

        if (!targetId || !newName) {
            return '❌ الاستخدام: تغيير_اسم [UserID/PlayerID] [الاسم الجديد]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }

        const existingPlayer = await Player.findOne({ name: newName, userId: { $ne: targetPlayer.userId } });
        if (existingPlayer) {
            return `❌ الاسم ${newName} مستخدم بالفعل.`;
        }

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
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }

        const genderCode = (newGenderRaw === 'ذكر' || newGenderRaw === 'male') ? 'male' : 'female';
        targetPlayer.gender = genderCode;
        await targetPlayer.save();

        return `✅ تم تغيير جنس اللاعب ${targetPlayer.name} إلى ${genderCode === 'male' ? 'ذكر' : 'أنثى'}.`;
    }

    async handleBanPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        const banStatusRaw = args[1] ? args[1].toLowerCase() : 'true';

        if (!targetId) {
            return '❌ الاستخدام: حظر_لاعب [UserID/PlayerID] [true/false]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }

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
            if (pendingPlayers.length === 0) {
                return '✅ لا يوجد لاعبين بانتظار الموافقة.';
            }

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
        if (args.length < 3) {
            return '❌ الاستخدام: اعطاء_مورد [ID] [اسم_العنصر] [الكمية]';
        }

        const targetId = args[0];
        const quantity = parseInt(args[args.length - 1], 10);
        const rawItemName = args.slice(1, args.length - 1).join(' ').toLowerCase();

        const itemId = itemMap[rawItemName] || rawItemName;
        const itemInfo = items[itemId];

        if (!itemInfo || isNaN(quantity) || quantity <= 0) {
            return `❌ العنصر غير موجود أو الكمية غير صالحة.`;
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }

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
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }

        if (statToChange === 'maxHealth') {
            targetPlayer.maxHealth += amount;
            targetPlayer.health += amount;
        } else if (statToChange === 'maxMana') {
            targetPlayer.maxMana += amount;
            targetPlayer.mana += amount;
        }

        await targetPlayer.save();

        return `✅ تم زيادة ${statToChange === 'maxHealth' ? 'الصحة' : 'المانا'} للاعب ${targetPlayer.name} بمقدار ${amount}.`;
    }

    async handleGiveGold(args, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) {
            return '❌ الاستخدام: اعطاء_ذهب [UserID/PlayerID] [الكمية]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب "${targetId}".`;
        }

        targetPlayer.addGold(amount);
        await targetPlayer.save();

        return `✅ تم إعطاء اللاعب ${targetPlayer.name} مبلغ ${amount} غولد.`;
    }

    // ===================================
    // النظام الاقتصادي
    // ===================================

    async handlePendingWithdrawals(args, senderId) {
        if (!this.isAdmin(senderId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        try {
            const allPlayers = await Player.find({
                registrationStatus: 'completed',
                banned: false
            });

            const pendingPlayers = allPlayers.filter(player =>
                player.pendingWithdrawal && player.pendingWithdrawal.status === 'pending'
            );

            if (pendingPlayers.length === 0) {
                return '📭 لا توجد طلبات سحب معلقة.';
            }

            let message = `📋 طلبات السحب المعلقة (${pendingPlayers.length}):\n\n`;

            pendingPlayers.forEach((p, index) => {
                message += `${index + 1}. ${p.name} (${p.userId})\n`;
                message += `   💰 ${p.pendingWithdrawal.amount} غولد\n\n`;
            });

            return message;
        } catch (error) {
            console.error('Error fetching pending withdrawals:', error);
            return '❌ حدث خطأ أثناء جلب طلبات السحب.';
        }
    }

    async handleProcessWithdrawal(args, senderId) {
        if (!this.isAdmin(senderId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        if (args.length < 2) {
            return '❌ الاستخدام: معالجة_سحب [player_id] [قبول/رفض]';
        }

        const targetPlayerId = args[0];
        const action = args[1].toLowerCase();

        try {
            let targetPlayer = await Player.findOne({ userId: targetPlayerId });
            if (!targetPlayer) {
                targetPlayer = await Player.findOne({ playerId: targetPlayerId });
            }
            if (!targetPlayer) {
                targetPlayer = await Player.findOne({ name: new RegExp(targetPlayerId, 'i') });
            }

            if (!targetPlayer) {
                return `❌ لم يتم العثور على اللاعب "${targetPlayerId}"`;
            }

            if (!targetPlayer.pendingWithdrawal || targetPlayer.pendingWithdrawal.status !== 'pending') {
                return '❌ لا يوجد طلب سحب معلق لهذا اللاعب.';
            }

            const withdrawalAmount = targetPlayer.pendingWithdrawal.amount;

            if (action === 'قبول' || action === 'موافقة') {
                targetPlayer.pendingWithdrawal.status = 'completed';
                await targetPlayer.save();
                return `✅ تمت معالجة طلب السحب بنجاح!\n👤 اللاعب: ${targetPlayer.name}\n💰 المبلغ: ${withdrawalAmount} غولد`;
            } else if (action === 'رفض') {
                targetPlayer.gold += withdrawalAmount;
                targetPlayer.pendingWithdrawal.status = 'rejected';
                await targetPlayer.save();
                return `❌ تم رفض طلب السحب.\n👤 اللاعب: ${targetPlayer.name}\n💰 تم إعادة ${withdrawalAmount} غولد.`;
            } else {
                return '❌ إجراء غير معروف. استخدم: قبول أو رفض';
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            return '❌ حدث خطأ أثناء معالجة طلب السحب.';
        }
    }

    async handleAddGold(args, senderId) {
        if (!this.isAdmin(senderId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        if (args.length < 2) {
            return '❌ الاستخدام: اضافة_غولد [player_id] [amount]';
        }

        const targetPlayerId = args[0];
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0) {
            return '❌ يرجى تحديد مبلغ صحيح.';
        }

        try {
            let targetPlayer = await Player.findOne({ userId: targetPlayerId });
            if (!targetPlayer) {
                targetPlayer = await Player.findOne({ playerId: targetPlayerId });
            }
            if (!targetPlayer) {
                targetPlayer = await Player.findOne({ name: new RegExp(targetPlayerId, 'i') });
            }

            if (!targetPlayer) {
                return '❌ اللاعب غير موجود.';
            }

            targetPlayer.gold += amount;
            targetPlayer.transactions.push({
                id: this.generateUniqueId(),
                type: 'deposit',
                amount: amount,
                status: 'completed',
                description: 'إيداع من المدير'
            });

            await targetPlayer.save();

            return `✅ تمت إضافة ${amount} غولد للاعب ${targetPlayer.name}.`;
        } catch (error) {
            console.error('Error adding gold:', error);
            return '❌ حدث خطأ أثناء إضافة الغولد.';
        }
    }

    // ===================================
    // الردود التلقائية
    // ===================================

    async handleAddAutoResponse(args, senderId) {
        if (!this.isAdmin(senderId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const input = args.join(' ');
        const parts = input.split('||');

        if (parts.length < 2) {
            return '❌ الاستخدام: اضف_رد [الكلمة] || [الرد]';
        }

        const keyword = parts[0].trim().toLowerCase();
        const response = parts.slice(1).join('||').trim();

        if (!keyword || !response) {
            return '❌ يجب تحديد الكلمة المفتاحية والرد.';
        }

        this.autoResponseSystem.addResponse(keyword, response);

        return `✅ تم إضافة رد تلقائي للكلمة "${keyword}".`;
    }

    async handleRemoveAutoResponse(args, senderId) {
        if (!this.isAdmin(senderId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const keyword = args.join(' ').toLowerCase().trim();

        if (!keyword) {
            return '❌ الاستخدام: ازل_رد [الكلمة]';
        }

        const removed = this.autoResponseSystem.removeResponse(keyword);

        if (!removed) {
            return `❌ لا يوجد رد تلقائي للكلمة "${keyword}".`;
        }

        return `✅ تم حذف الرد التلقائي للكلمة "${keyword}".`;
    }

    async handleShowAutoResponses(args, senderId) {
        if (!this.isAdmin(senderId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const allResponses = this.autoResponseSystem.getAllResponses();
        const totalResponses = Object.keys(allResponses).length;

        if (totalResponses === 0) {
            return '📝 لا توجد ردود تلقائية.';
        }

        let message = `🤖 الردود التلقائية (${totalResponses}):\n\n`;

        for (const [keyword, response] of Object.entries(allResponses)) {
            message += `• ${keyword}: ${response}\n`;
        }

        return message;
    }

    findAutoResponse(message) {
        return this.autoResponseSystem.findAutoResponse(message);
    }
        }
