// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
import { items } from '../../data/items.js'; 

export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
        console.log('✅ نظام المدير تم تهيئته');
    }

    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const isAdmin = userId === ADMIN_PSID;
        
        if (isAdmin) {
            console.log(`🎯 تم التعرف على المدير: ${userId}`);
        }
        
        return isAdmin;
    }

    async setupAdminPlayer(userId, userName) {
        try {
            let player = await Player.findOne({ userId });
            
            if (!player) {
                player = await Player.createNew(userId, userName);
            }

            player.registrationStatus = 'completed';
            player.gender = 'male';
            player.playerId = `ADMIN_${Date.now().toString().slice(-6)}`;
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
            'موافقة_لاعب': 'عرض/موافقة اللاعبين المنتظرين',
            'تغيير_اسم': 'تغيير اسم اللاعب [ID] [الاسم الجديد]',
            'تغيير_جنس': 'تغيير جنس اللاعب [ID] [ذكر/أنومى]',
            'حظر_لاعب': 'حظر/رفع حظر اللاعب [ID] [true/false]',
            'اصلاح_تسجيل': 'إصلاح مشاكل التسجيل',
            'اعادة_بيانات': 'بدء اللاعب من جديد (حذف البيانات)',
            'اعطاء_ذهب': 'منح اللاعب ذهب [ID] [الكمية]',
            'اعطاء_مورد': 'منح مورد/عنصر [ID] [ItemID] [الكمية]',
            'زيادة_صحة': 'زيادة الحد الأقصى للصحة [ID] [الكمية]',
            'زيادة_مانا': 'زيادة الحد الأقصى للمانا [ID] [الكمية]',
            'اضف_رد': 'إضافة رد تلقائي',
            'ازل_رد': 'إزالة رد تلقائي',
            'عرض_الردود': 'عرض الردود التلقائية',
            'مدير': 'عرض أوامر المدير'
        };
    }

    getAdminHelp() {
        const commands = this.getAdminCommands();
        let helpMessage = '👑 **أوامر المدير - مغارة غولد**\n\n';

        const commandGroups = {
            '🛠️ الإدارة': ['تغيير_اسم', 'تغيير_جنس', 'حظر_لاعب', 'موافقة_لاعب', 'اصلاح_تسجيل', 'اعادة_بيانات'],
            '🎁 المنح': ['اعطاء_ذهب', 'اعطاء_مورد', 'زيادة_صحة', 'زيادة_مانا'],
            '🤖 الردود': ['اضف_رد', 'ازل_رد', 'عرض_الردود'],
            '❓ معلومات': ['مدير']
        };

        for (const group in commandGroups) {
            helpMessage += `\n**${group}:**\n`;
            commandGroups[group].forEach(cmd => {
                if (commands[cmd]) {
                    helpMessage += `• **${cmd}** - ${commands[cmd].split(' [')[0]}\n`;
                }
            });
        }

        helpMessage += '\n💡 **ملاحظة:** الأقواس المربعة [ ] تعني مطلوب في الأمر.';
        return helpMessage;
    }

    async handleAdminCommand(command, args, senderId, player) {
        const findTargetPlayer = async (id) => {
            return await Player.findOne({ $or: [{ userId: id }, { playerId: id }] });
        };
        
        switch (command) {
            case 'مدير': return this.getAdminHelp();
            case 'موافقة_لاعب': return await this.handleApprovePlayer(args, senderId);
            case 'اعادة_بيانات': return await this.handleResetPlayer(args, findTargetPlayer);
            case 'تغيير_اسم': return await this.handleSetPlayerName(args, findTargetPlayer);
            case 'تغيير_جنس': return await this.handleSetPlayerGender(args, findTargetPlayer);
            case 'حظر_لاعب': return await this.handleBanPlayer(args, findTargetPlayer);
            case 'اعطاء_ذهب': return await this.handleGiveGold(args, findTargetPlayer);
            case 'اعطاء_مورد': return await this.handleGiveItem(args, findTargetPlayer);
            case 'زيادة_صحة': return await this.handleIncreaseStat(args, 'maxHealth', findTargetPlayer);
            case 'زيادة_مانا': return await this.handleIncreaseStat(args, 'maxMana', findTargetPlayer);
            // ... (بقية أوامر الردود)
            default: return '❌ أمر مدير غير معروف';
        }
    }
    
    // ===================================
    // 1. أوامر الإدارة الأساسية (إصلاح الاسم)
    // ===================================
    
    // 🆕 إعادة تعيين اللاعب (تحرير الاسم القديم)
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

        // 💡 حذف اللاعب بالكامل لتحرير الاسم
        await targetPlayer.deleteOne();
        
        // إعادة إنشاء كائن جديد بـ 'pending'
        const newPlayer = await Player.createNew(targetPlayer.userId, targetPlayer.name);
        newPlayer.registrationStatus = 'pending';
        // لا نحتاج لـ save إضافية لأن createNew تقوم بذلك

        return `🗑️ تم مسح وإعادة تعيين بيانات اللاعب **${oldName}** بنجاح.\n(الاسم **${oldName}** أصبح متاحاً الآن للاستخدام من قبل أي شخص آخر).\nسيحتاج لبدء التسجيل من جديد.`;
    }


    // 🛠️ إصلاح مشكلة تغيير الاسم (تحرير الاسم القديم)
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
        
        // التحقق من أن الاسم الجديد غير مستخدم من قبل لاعب آخر
        const existingPlayer = await Player.findOne({ name: newName, userId: { $ne: targetPlayer.userId } });
        if (existingPlayer) {
            return `❌ الاسم **${newName}** مستخدم بالفعل من قبل لاعب آخر.`;
        }

        const oldName = targetPlayer.name;
        
        // تحديث الاسم
        targetPlayer.name = newName;
        await targetPlayer.save();
        
        return `✅ تم تحديث اسم اللاعب **${oldName}** بنجاح إلى: **${newName}**.\n(الاسم **${oldName}** أصبح متاحًا الآن).`;
    }

    // 🆕 تغيير الجنس
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

    // 🆕 حظر لاعب
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
    
    async handleApprovePlayer(args, senderId) { /* ... */ }
    async handleFixRegistration(args, senderId) { /* ... */ }


    // ===================================
    // 2. أوامر منح الإحصائيات والأغراض
    // ===================================

    // 🆕 إعطاء الذهب
    async handleGiveGold(args, findTargetPlayer) {
        const targetId = args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount) || amount <= 0) {
            return '❌ الاستخدام: اعطاء_ذهب [UserID/PlayerID] [الكمية]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        targetPlayer.addGold(amount);
        await targetPlayer.save();

        return `💰 تم إعطاء اللاعب **${targetPlayer.name}** عدد **${amount}** غولد بنجاح. رصيده الجديد: ${targetPlayer.gold}`;
    }

    // 🆕 إعطاء العناصر
    async handleGiveItem(args, findTargetPlayer) {
        const targetId = args[0];
        const itemId = args[1];
        const quantity = parseInt(args[2], 10) || 1;

        if (!targetId || !itemId || !items[itemId] || quantity <= 0) {
            return `❌ الاستخدام: اعطاء_مورد [ID] [ItemID] [الكمية]\n(تحقق من ID العنصر)`;
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        const itemInfo = items[itemId];
        targetPlayer.addItem(itemInfo.id, itemInfo.name, itemInfo.type, quantity);
        await targetPlayer.save();

        return `🎒 تم إضافة ${quantity} × **${itemInfo.name}** للاعب **${targetPlayer.name}** بنجاح.`;
    }

    // 🆕 زيادة الإحصائيات (الصحة والمانا)
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
    
    // ... (بقية دوال الردود التلقائية)
    // ===================================
    // 3. أوامر الردود التلقائية (تبقى كما هي مع تصحيح بسيط في الاستيراد)
    // ===================================
    
    // 💡 يجب التأكد من عمل نظام الردود التلقائية بشكل منفصل وترك هذه الدوال للاستدعاء الخارجي
    async handleAddResponse(args) { /* ... */ }
    async handleRemoveResponse(args) { /* ... */ }
    async handleShowResponses() { /* ... */ }
}
