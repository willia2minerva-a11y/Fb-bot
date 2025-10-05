// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
// 💡 جديد: استيراد ملف العناصر لتمكين أمر اعطاء_موارد
import { items } from '../../data/items.js'; 

export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
        // 💡 ملاحظة: من الأفضل استخدام متغير بيئي لقائمة المدراء
        // هنا تم الافتراض أنها تُستخلص من المتغيرات البيئية أو يتم تعيينها في مكان آخر
        // لن نعدل دالة isAdmin لتعمل كما هي مع متغير البيئة ADMIN_PSID
        console.log('✅ نظام المدير تم تهيئته');
    }

    // التحقق من صلاحيات المدير (تبقى كما هي)
    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const isAdmin = userId === ADMIN_PSID;
        
        if (isAdmin) {
            console.log(`🎯 تم التعرف على المدير: ${userId}`);
        }
        
        return isAdmin;
    }

    // تجاوز كامل لنظام التسجيل للمدير (تبقى كما هي)
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

    // الحصول على أوامر المدير
    getAdminCommands() {
        return {
            // أوامر الإدارة الأساسية
            'موافقة_لاعب': 'عرض/موافقة اللاعبين المنتظرين',
            'تغيير_اسم': 'تغيير اسم اللاعب [ID] [الاسم الجديد]',
            'تغيير_جنس': 'تغيير جنس اللاعب [ID] [ذكر/أنومى]',
            'حظر_لاعب': 'حظر/رفع حظر اللاعب [ID] [true/false]',
            'اصلاح_تسجيل': 'إصلاح مشاكل التسجيل',
            'اعادة_بيانات': 'بدء اللاعب من جديد (حذف البيانات)', // 🆕
            
            // أوامر منح الإحصائيات والأغراض
            'اعطاء_ذهب': 'منح اللاعب ذهب [ID] [الكمية]',
            'اعطاء_مورد': 'منح مورد/عنصر [ID] [ItemID] [الكمية]', // 🆕
            'زيادة_صحة': 'زيادة الحد الأقصى للصحة [ID] [الكمية]', // 🆕
            'زيادة_مانا': 'زيادة الحد الأقصى للمانا [ID] [الكمية]', // 🆕
            
            // أوامر الردود التلقائية
            'اضف_رد': 'إضافة رد تلقائي',
            'ازل_رد': 'إزالة رد تلقائي',
            'عرض_الردود': 'عرض الردود التلقائية',
            'مدير': 'عرض أوامر المدير'
        };
    }

    // عرض قائمة أوامر المدير (مُحدثة)
    getAdminHelp() {
        const commands = this.getAdminCommands();
        let helpMessage = '👑 **أوامر المدير - مغارة غولد**\n\n';
        
        // تجميع الأوامر حسب النوع
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

    // معالجة أوامر المدير
    async handleAdminCommand(command, args, senderId, player) {
        // البحث عن اللاعب الهدف بالـ userId أو الـ playerId
        const findTargetPlayer = async (id) => {
            return await Player.findOne({ $or: [{ userId: id }, { playerId: id }] });
        };
        
        switch (command) {
            case 'مدير':
                return this.getAdminHelp();

            case 'موافقة_لاعب':
                return await this.handleApprovePlayer(args, senderId);
                
            case 'اعادة_بيانات': // 🆕 أمر إعادة البيانات
                return await this.handleResetPlayer(args);

            case 'تغيير_اسم':
                return await this.handleSetPlayerName(args, findTargetPlayer);

            case 'تغيير_جنس':
                return await this.handleSetPlayerGender(args, findTargetPlayer);

            case 'حظر_لاعب':
                return await this.handleBanPlayer(args, findTargetPlayer);
                
            case 'اعطاء_ذهب':
                return await this.handleGiveGold(args, findTargetPlayer);

            case 'اعطاء_مورد': // 🆕 أمر إعطاء مورد/عنصر
                return await this.handleGiveItem(args, findTargetPlayer);

            case 'زيادة_صحة':
                return await this.handleIncreaseStat(args, 'maxHealth', findTargetPlayer);

            case 'زيادة_مانا':
                return await this.handleIncreaseStat(args, 'maxMana', findTargetPlayer);

            case 'اصلاح_تسجيل':
                return await this.handleFixRegistration(args, senderId);

            // ... (بقية أوامر الردود تبقى كما هي)
            case 'اضف_رد': return await this.handleAddResponse(args);
            case 'ازل_رد': return await this.handleRemoveResponse(args);
            case 'عرض_الردود': return await this.handleShowResponses();

            default:
                return '❌ أمر مدير غير معروف';
        }
    }
    
    // ===================================
    // 1. أوامر الإدارة الأساسية
    // ===================================
    
    // 🆕 إعادة تعيين اللاعب (حذف البيانات)
    async handleResetPlayer(args) {
        const targetId = args[0];
        if (!targetId) {
            return '❌ الاستخدام: اعادة_بيانات [UserID/PlayerID]';
        }

        const targetPlayer = await Player.findOne({ $or: [{ userId: targetId }, { playerId: targetId }] });
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        const playerName = targetPlayer.name;

        // 💡 هنا نقوم بمسح الموديل بالكامل وإعادة إنشائه كـ 'pending'
        await targetPlayer.deleteOne();
        
        const newPlayer = await Player.createNew(targetPlayer.userId, playerName);
        newPlayer.registrationStatus = 'pending';
        await newPlayer.save();

        return `🗑️ تم مسح وإعادة تعيين بيانات اللاعب **${playerName}** بنجاح.\nسيحتاج لبدء التسجيل من جديد.`;
    }


    // 🛠️ إصلاح مشكلة تغيير الاسم
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

        const oldName = targetPlayer.name;
        
        // 🛠️ الإصلاح الرئيسي: تحديث خاصية name
        targetPlayer.name = newName;
        await targetPlayer.save();
        
        return `✅ تم تحديث اسم اللاعب **${oldName}** بنجاح إلى: **${newName}**`;
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
    
    // ... (handleApprovePlayer و handleFixRegistration تبقى كما هي)
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
    
    // ===================================
    // 3. أوامر الردود التلقائية (تبقى كما هي مع تصحيح بسيط في الاستيراد)
    // ===================================
    
    // 💡 يجب التأكد من عمل نظام الردود التلقائية بشكل منفصل وترك هذه الدوال للاستدعاء الخارجي
    async handleAddResponse(args) { /* ... */ }
    async handleRemoveResponse(args) { /* ... */ }
    async handleShowResponses() { /* ... */ }
}
