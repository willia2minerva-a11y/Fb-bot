// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
import { items } from '../../data/items.js'; 
import { AutoResponseSystem } from '../autoResponse/AutoResponseSystem.js';

// تخزين الردود التلقائية
const autoResponses = new Map();

export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
        this.autoResponseSystem = new AutoResponseSystem(); // 🆕 نظام الردود التلقائي
        console.log('👑 نظام المدير تم تهيئته');
    }

    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID; 
        const isAdmin = userId === ADMIN_PSID;
        
        if (isAdmin) {
            console.log(`🎯 تم التعرف على المدير: ${userId}`);
        }
        
        return isAdmin;
    }

    // دالة لتوليد معرف فريد
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
            'اصلاح_تسجيل': 'إصلاح تسجيل',
            'اعادة_بيانات': 'اعادة بيانات',
            'اعطاء_ذهب': 'اعطاء ذهب',
            'اعطاء_مورد': 'اعطاء مورد',
            'زيادة_صحة': 'زيادة صحة',
            'زيادة_مانا': 'زيادة مانا',
            // 🆕 الأوامر الجديدة
            'اضف_رد': 'إضافة رد تلقائي',
            'ازل_رد': 'إزالة رد تلقائي',
            'عرض_الردود': 'عرض جميع الردود',
            'طلبات_سحب': 'عرض طلبات السحب',
            'معالجة_سحب': 'معالجة طلب سحب',
            'اضافة_غولد': 'إضافة غولد للاعب',
            'مدير': 'مدير'
        };
    }

    getAdminHelp() {
        return `
👑 **أوامر المدير - دليل الاستخدام**

🛠️ **الإدارة والتحكم**
• تغيير_اسم [ID] [الاسم]: يغير اسم اللاعب ويحرر الاسم القديم.
• اعادة_بيانات [ID]: يمسح بيانات اللاعب ليبدأ التسجيل من جديد (يحرر الاسم).
• حظر_لاعب [ID] [صحيح/خطأ]: لحظر/رفع الحظر.
• تغيير_جنس [ID] [ذكر/أنثى]: يغير جنس اللاعب.
• موافقة_لاعب [ID]: عرض القائمة أو الموافقة على ID محدد.

💰 **النظام الاقتصادي (الجديد)**
• طلبات_سحب: عرض طلبات السحب المعلقة
• معالجة_سحب [ID] [قبول/رفض]: معالجة طلب سحب لاعب
• اضافة_غولد [ID] [المبلغ]: إضافة غولد للاعب (للإيداع)

🤖 **إدارة الردود التلقائية**
• اضف_رد [الكلمة المفتاحية] || [الرد]: إضافة رد تلقائي
• ازل_رد [الكلمة المفتاحية]: إزالة رد تلقائي
• عرض_الردود: عرض جميع الردود التلقائية

🎁 **أوامر المنح (المنح):**
• اعطاء_ذهب [ID] [الكمية]: يمنح ذهباً.
• اعطاء_مورد [ID] [اسم_العنصر] [الكمية]: يمنح عنصر أو سلاح.
• زيادة_صحة [ID] [الكمية]: يزيد الحد الأقصى للصحة.
• زيادة_مانا [ID] [الكمية]: يزيد الحد الأقصى للمانا.

`;
    }

    async handleAdminCommand(command, args, senderId, player, itemMap) {
    const findTargetPlayer = async (id) => {
        if (!id) return null;
        
        // البحث بـ userId (المعرف الأساسي)
        let targetPlayer = await Player.findOne({ userId: id });
        if (targetPlayer) return targetPlayer;
        
        // البحث بـ playerId (المعرف التسلسلي)
        targetPlayer = await Player.findOne({ playerId: id });
        if (targetPlayer) return targetPlayer;
        
        // البحث في الاسم (إذا كان المدير يريد البحث بالاسم)
        targetPlayer = await Player.findOne({ name: new RegExp(id, 'i') });
        
        return targetPlayer;
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
            
            // 🆕 الأوامر الجديدة
            case 'طلبات_سحب': return await this.handlePendingWithdrawals(args, senderId);
            case 'معالجة_سحب': return await this.handleProcessWithdrawal(args, senderId);
            case 'اضافة_غولد': return await this.handleAddGold(args, senderId);
            case 'اضف_رد': return await this.handleAddAutoResponse(args, senderId);
            case 'ازل_رد': return await this.handleRemoveAutoResponse(args, senderId);
            case 'عرض_الردود': return await this.handleShowAutoResponses(args, senderId);
            
            default: return '❌ أمر مدير غير معروف';
        }
    }
    
    // ===================================
    // 1. أوامر الإدارة الأساسية (موجودة سابقاً)
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

        return `🗑️ تم مسح وإعادة تعيين بيانات اللاعب **${oldName}** بنجاح.\n(الاسم **${oldName}** أصبح متاحاً الآن للاستخدام من قبل أي شخص آخر).\nسيحتاج لبدء التسجيل من جديد.`;
    }

    async handleSetPlayerName(args, findTargetPlayer) {
        const targetId = args[0];
        const newName = args.slice(1).join(' ');

        if (!targetId || !newName) {
            return '❌ الاستخدام: تغيير_اسم [UserID/PlayerID] [الاسم الجديد]';
        }
        
        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب بالمعرّف ${targetId}.`;
        }
        
        const existingPlayer = await Player.findOne({ name: newName, userId: { $ne: targetPlayer.userId } });
        if (existingPlayer) {
            return `❌ الاسم **${newName}** مستخدم بالفعل من قبل لاعب آخر.`;
        }

        const oldName = targetPlayer.name;
        targetPlayer.name = newName;
        await targetPlayer.save();
        
        return `✅ تم تحديث اسم اللاعب **${oldName}** بنجاح إلى: **${newName}**.\n(الاسم **${oldName}** أصبح متاحًا الآن).`;
    }

    async handleSetPlayerGender(args, findTargetPlayer) {
        const targetId = args[0];
        const newGenderRaw = args[1] ? args[1].toLowerCase() : null;

        if (!targetId || (newGenderRaw !== 'ذكر' && newGenderRaw !== 'أنثى' && newGenderRaw !== 'male' && newGenderRaw !== 'female')) {
            return '❌ الاستخدام: تغيير_جنس [UserID/PlayerID] [ذكر/أنثى]';
        }
        
        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }

        const genderCode = (newGenderRaw === 'ذكر' || newGenderRaw === 'male') ? 'male' : 'female';
        const genderName = (newGenderRaw === 'ذكر' || newGenderRaw === 'male') ? 'ذكر 👦' : 'أنثى 👧';
        
        targetPlayer.gender = genderCode;
        await targetPlayer.save();

        return `🚻 تم تغيير جنس اللاعب **${targetPlayer.name}** إلى **${genderName}** بنجاح.`;
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

        return `🚫 تم **${isBanning ? 'حظر' : 'رفع الحظر عن'}** اللاعب **${targetPlayer.name}** بنجاح.`;
    }
    
    async handleApprovePlayer(args, senderId) {
        const RegistrationSystem = (await import('../registration/RegistrationSystem.js')).RegistrationSystem;
        const registrationSystem = new RegistrationSystem();

        if (args.length === 0) {
            const pendingPlayers = await registrationSystem.getPendingPlayers();
            if (pendingPlayers.length === 0) {
                return '✅ لا يوجد لاعبين بانتظار الموافقة.';
            }

            let message = '⏳ **اللاعبين المنتظرين للموافقة:**\n\n';
            pendingPlayers.forEach((p, index) => {
                message += `${index + 1}. ${p.name} - \`${p.userId}\` - ${new Date(p.createdAt).toLocaleDateString('ar-SA')}\n`;
            });
            
            message += '\nللموافقة، اكتب: موافقة_لاعب [المعرف]';
            return message;
        }

        const targetUserId = args[0];
        return await registrationSystem.approvePlayer(targetUserId, senderId);
    }
    
    async handleFixRegistration(args, senderId) {
        const RegistrationSystem = (await import('../registration/RegistrationSystem.js')).RegistrationSystem;
        const registrationSystem = new RegistrationSystem();

        let targetUserId = senderId;
        if (args.length > 0) {
            targetUserId = args[0];
        }

        const success = await registrationSystem.resetRegistration(targetUserId);
        
        if (success) {
            return `✅ **تم إصلاح التسجيل للمستخدم ${targetUserId}**`;
        } else {
            return `❌ لم يتم العثور على لاعب بالمعرف: ${targetUserId}`;
        }
    }

    async handleGiveItem(args, findTargetPlayer, itemMap) { 
        if (args.length < 3) {
            return `❌ صيغة خاطئة. الاستخدام: اعطاء_مورد [ID] [اسم_العنصر] [الكمية]`;
        }
        
        const targetId = args[0];
        const quantity = parseInt(args[args.length - 1], 10);
        const rawItemNameArray = args.slice(1, args.length - 1);
        const rawItemName = rawItemNameArray.join(' ').toLowerCase();

        const itemId = itemMap[rawItemName] || rawItemName;
        const itemInfo = items[itemId];

        if (!itemInfo || isNaN(quantity) || quantity <= 0) {
            return `❌ صيغة خاطئة أو العنصر غير موجود.\nالاستخدام: اعطاء_مورد [ID] [اسم_العنصر] [الكمية]\n(تحقق: هل العنصر **${rawItemName}** موجود؟ هل الكمية رقم؟)`;
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        targetPlayer.addItem(itemInfo.id, itemInfo.name, itemInfo.type, quantity);
        await targetPlayer.save();

        return `🎒 تم إضافة ${quantity} × **${itemInfo.name}** للاعب **${targetPlayer.name}** بنجاح.`;
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

        let statNameAr;
        if (statToChange === 'maxHealth') {
            targetPlayer.maxHealth += amount;
            targetPlayer.health += amount; 
            statNameAr = 'الصحة القصوى ❤️';
        } else if (statToChange === 'maxMana') {
            targetPlayer.maxMana += amount;
            targetPlayer.mana += amount; 
            statNameAr = 'المانا القصوى ⚡';
        }
        
        await targetPlayer.save();

        return `📈 تم زيادة **${statNameAr}** للاعب **${targetPlayer.name}** بمقدار ${amount}.`;
    }
    
    async handleGiveGold(args, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) {
            return '❌ الاستخدام: اعطاء_ذهب [UserID/PlayerID/الاسم] [الكمية]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب "${targetId}".\n💡 جرب:\n• معرف المستخدم (UserID)\n• المعرف التسلسلي (PlayerID)\n• اسم اللاعب`;
        }
    
       targetPlayer.addGold(amount);
       await targetPlayer.save();

       return `💰 تم إعطاء اللاعب **${targetPlayer.name}** عدد **${amount}** غولد بنجاح.\n🆔 المعرف: ${targetPlayer.userId}\n💎 الرصيد الجديد: ${targetPlayer.gold}`;
   }

    // ===================================
    // 🆕 2. النظام الاقتصادي (الجديد)
    // ===================================

    async handlePendingWithdrawals(args, senderId) {
        if (!this.isAdmin(senderId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        try {
            const pendingPlayers = await Player.find({
                'pendingWithdrawal.status': 'pending'
            });

            if (pendingPlayers.length === 0) {
                return '📭 لا توجد طلبات سحب معلقة.';
            }

            let message = `📋 **طلبات السحب المعلقة (${pendingPlayers.length}):**\n\n`;
            
            pendingPlayers.forEach((p, index) => {
                message += `${index + 1}. 👤 ${p.name} (${p.userId})\n`;
                message += `   💰 ${p.pendingWithdrawal.amount} غولد\n`;
                message += `   ⏰ ${p.pendingWithdrawal.requestedAt.toLocaleString('ar-SA')}\n`;
                message += `   🎯 معالجة: \`معالجة_سحب ${p.userId} قبول/رفض\`\n\n`;
            });

    async handleProcessWithdrawal(args, senderId) {
    if (!this.isAdmin(senderId)) {
        return '❌ هذا الأمر خاص بالمدراء فقط.';
    }

    if (args.length < 2) {
        return '❌ الاستخدام: معالجة_سحب [player_id] [قبول/رفض]\nمثال: معالجة_سحب 123456 قبول';
    }

    const targetPlayerId = args[0];
    const action = args[1].toLowerCase();

    try {
        // البحث بجميع الطرق الممكنة
        let targetPlayer = await Player.findOne({ userId: targetPlayerId });
        if (!targetPlayer) {
            targetPlayer = await Player.findOne({ playerId: targetPlayerId });
        }
        if (!targetPlayer) {
            targetPlayer = await Player.findOne({ name: new RegExp(targetPlayerId, 'i') });
        }
            
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب "${targetPlayerId}"\n💡 جرب:\n• معرف المستخدم\n• المعرف التسلسلي\n• اسم اللاعب`;
        }

        if (!targetPlayer.pendingWithdrawal || targetPlayer.pendingWithdrawal.status !== 'pending') {
            return '❌ لا يوجد طلب سحب معلق لهذا اللاعب.';
        }

        const withdrawalAmount = targetPlayer.pendingWithdrawal.amount;

        if (action === 'قبول' || action === 'موافقة') {
            targetPlayer.pendingWithdrawal.status = 'completed';
            
            // تحديث المعاملة
            const transaction = targetPlayer.transactions.find(t => 
                t.type === 'withdrawal' && t.status === 'pending'
            );
            if (transaction) {
                transaction.status = 'completed';
                transaction.description = `سحب مكتمل - ${withdrawalAmount} غولد`;
            }

            await targetPlayer.save();

            return `✅ تمت معالجة طلب السحب بنجاح!\n👤 اللاعب: ${targetPlayer.name}\n💰 المبلغ: ${withdrawalAmount} غولد\n🆔 المعرف: ${targetPlayer.userId}`;

        } else if (action === 'رفض' || action === 'رفض') {
            targetPlayer.gold += withdrawalAmount;
            targetPlayer.pendingWithdrawal.status = 'rejected';
            
            // تحديث المعاملة
            const transaction = targetPlayer.transactions.find(t => 
                t.type === 'withdrawal' && t.status === 'pending'
            );
            if (transaction) {
                transaction.status = 'rejected';
                transaction.description = `سحب مرفوض - ${withdrawalAmount} غولد`;
            }

            await targetPlayer.save();

            return `❌ تم رفض طلب السحب.\n👤 اللاعب: ${targetPlayer.name}\n💰 المبلغ: ${withdrawalAmount} غولد\n💎 تم إعادة المبلغ للرصيد.`;

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
            return '❌ usage: اضافة_غولد [player_id] [amount]';
        }

        const targetPlayerId = args[0];
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0) {
            return '❌ يرجى تحديد مبلغ صحيح.';
        }

        try {
            const targetPlayer = await Player.findOne({ userId: targetPlayerId });
            if (!targetPlayer) {
                return '❌ اللاعب غير موجود.';
            }

            targetPlayer.gold += amount;
            
            targetPlayer.transactions.push({
                id: this.generateUniqueId(),
                type: 'deposit',
                amount: amount,
                status: 'completed',
                description: `إيداع من المدير`
            });

            await targetPlayer.save();

            return `✅ تمت إضافة ${amount} غولد للاعب ${targetPlayer.name} بنجاح!\n💰 الرصيد الجديد: ${targetPlayer.gold} غولد`;

        } catch (error) {
            console.error('Error adding gold:', error);
            return '❌ حدث خطأ أثناء إضافة الغولد.';
        }
    }

    // ===================================
// 🆕 3. الردود التلقائية (المحسنة)
// ===================================

async handleAddAutoResponse(args, senderId) {
    if (!this.isAdmin(senderId)) {
        return '❌ هذا الأمر خاص بالمدراء فقط.';
    }

    const input = args.join(' ');
    const parts = input.split('||');

    if (parts.length < 2) {
        return '❌ الاستخدام: اضف_رد [الكلمة المفتاحية] || [الرد]\nمثال: اضف_رد مرحبا || أهلاً وسهلاً بك!';
    }

    const keyword = parts[0].trim().toLowerCase();
    const response = parts.slice(1).join('||').trim();

    if (!keyword || !response) {
        return '❌ يجب تحديد الكلمة المفتاحية والرد.';
    }

    // استخدام نظام الردود التلقائي المستورد
    this.autoResponseSystem.addResponse(keyword, response);

    return `✅ تم إضافة رد تلقائي بنجاح!\n\n🔑 الكلمة المفتاحية: ${keyword}\n💬 الرد: ${response}\n\n💡 الآن عندما يكتب أي لاعب "${keyword}" سيرد البوت تلقائياً.`;
}

async handleRemoveAutoResponse(args, senderId) {
    if (!this.isAdmin(senderId)) {
        return '❌ هذا الأمر خاص بالمدراء فقط.';
    }

    const keyword = args.join(' ').toLowerCase().trim();

    if (!keyword) {
        return '❌ الاستخدام: ازل_رد [الكلمة المفتاحية]';
    }

    // استخدام نظام الردود التلقائي المستورد
    const removed = this.autoResponseSystem.removeResponse(keyword);
    
    if (!removed) {
        return `❌ لا يوجد رد تلقائي للكلمة المفتاحية "${keyword}".`;
    }

    return `✅ تم حذف الرد التلقائي للكلمة "${keyword}" بنجاح.`;
}

async handleShowAutoResponses(args, senderId) {
    if (!this.isAdmin(senderId)) {
        return '❌ هذا الأمر خاص بالمدراء فقط.';
    }

    const allResponses = this.autoResponseSystem.getAllResponses();
    const totalResponses = Object.keys(allResponses).length;
    
    if (totalResponses === 0) {
        return '📝 لا توجد ردود تلقائية مضافة حالياً.';
    }

    // تحديد الصفحة المطلوبة
    const page = parseInt(args[0]) || 1;
    const perPage = 8;
    const totalPages = Math.ceil(totalResponses / perPage);

    if (page < 1 || page > totalPages) {
        return `❌ الصفحة ${page} غير موجودة. إجمالي الصفحات: ${totalPages}`;
    }

    let message = `🤖 الردود التلقائية (${totalResponses}) - الصفحة ${page} من ${totalPages}:\n\n`;

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    const responsesArray = Object.entries(allResponses);
    
    for (let i = startIndex; i < endIndex && i < responsesArray.length; i++) {
        const [keyword, response] = responsesArray[i];
        const shortResponse = response.length > 60 ? response.substring(0, 60) + '...' : response;
        message += `${i + 1}. ${keyword}\n   ${shortResponse}\n\n`;
    }

    message += `📄 للتنقل: عرض_الردود [رقم الصفحة]\n`;
    message += `💡 الأوامر: اضف_رد | ازل_رد`;

    return message;
}

// 🆕 دالة مساعدة للبحث عن رد تلقائي
findAutoResponse(message) {
    return this.autoResponseSystem.findAutoResponse(message);
                                           }
