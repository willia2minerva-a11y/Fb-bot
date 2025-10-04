import Player from '../../core/Player.js';

export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
        console.log('✅ نظام المدير تم تهيئته');
    }

    // التحقق من صلاحيات المدير
    isAdmin(userId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        const isAdmin = userId === ADMIN_PSID;
        
        if (isAdmin) {
            console.log(`🎯 تم التعرف على المدير: ${userId}`);
        }
        
        return isAdmin;
    }

    // تجاوز كامل لنظام التسجيل للمدير
    async setupAdminPlayer(userId, userName) {
        try {
            let player = await Player.findOne({ userId });
            
            if (!player) {
                player = await Player.createNew(userId, userName);
            }

            // إعداد المدير مباشرة بدون انتظار موافقة
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
            'موافقة_لاعب': 'عرض/موافقة اللاعبين المنتظرين',
            'تغيير_اسم': 'تغيير اسم اللاعب',
            'اصلاح_تسجيل': 'إصلاح مشاكل التسجيل',
            'اضف_رد': 'إضافة رد تلقائي',
            'ازل_رد': 'إزالة رد تلقائي',
            'عرض_الردود': 'عرض الردود التلقائية',
            'مدير': 'عرض أوامر المدير'
        };
    }

    // عرض قائمة أوامر المدير
    getAdminHelp() {
        const commands = this.getAdminCommands();
        let helpMessage = '👑 **أوامر المدير - مغارة غولد**\n\n';

        for (const [command, description] of Object.entries(commands)) {
            helpMessage += `• **${command}** - ${description}\n`;
        }

        helpMessage += '\n💡 **ملاحظة:** المدير يمكنه استخدام جميع أوامر اللعبة دون قيود.';
        return helpMessage;
    }

    // معالجة أوامر المدير
    async handleAdminCommand(command, args, senderId, player) {
        switch (command) {
            case 'مدير':
                return this.getAdminHelp();

            case 'موافقة_لاعب':
                return await this.handleApprovePlayer(args, senderId);

            case 'تغيير_اسم':
                return await this.handleChangeName(args, senderId, player);

            case 'اصلاح_تسجيل':
                return await this.handleFixRegistration(args, senderId);

            case 'اضف_رد':
                return await this.handleAddResponse(args);

            case 'ازل_رد':
                return await this.handleRemoveResponse(args);

            case 'عرض_الردود':
                return await this.handleShowResponses();

            default:
                return '❌ أمر مدير غير معروف';
        }
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

    async handleChangeName(args, senderId, player) {
        const ProfileSystem = (await import('../profile/ProfileSystem.js')).ProfileSystem;
        const profileSystem = new ProfileSystem();

        return await profileSystem.changeName(player, args, senderId);
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

    async handleAddResponse(args) {
        const AutoResponseSystem = (await import('../autoResponse/AutoResponseSystem.js')).AutoResponseSystem;
        const autoResponseSystem = new AutoResponseSystem();

        if (args.length < 2) {
            return '❌ صيغة الأمر: اضف_رد [المفتاح] [الرد]';
        }

        const trigger = args[0];
        const response = args.slice(1).join(' ');

        autoResponseSystem.addResponse(trigger, response);

        return `✅ **تم إضافة رد تلقائي بنجاح!**\n🔑 المفتاح: ${trigger}\n💬 الرد: ${response}`;
    }

    async handleRemoveResponse(args) {
        const AutoResponseSystem = (await import('../autoResponse/AutoResponseSystem.js')).AutoResponseSystem;
        const autoResponseSystem = new AutoResponseSystem();

        if (args.length === 0) {
            return '❌ يرجى تحديد المفتاح المراد إزالته.';
        }

        const trigger = args[0];
        const success = autoResponseSystem.removeResponse(trigger);

        if (success) {
            return `✅ **تم إزالة الرد التلقائي بنجاح!**`;
        } else {
            return `❌ لم يتم العثور على رد تلقائي للمفتاح: ${trigger}`;
        }
    }

    async handleShowResponses() {
        const AutoResponseSystem = (await import('../autoResponse/AutoResponseSystem.js')).AutoResponseSystem;
        const autoResponseSystem = new AutoResponseSystem();

        const responses = autoResponseSystem.getAllResponses();
        const responseKeys = Object.keys(responses);

        if (responseKeys.length === 0) {
            return '🤖 **لا توجد ردود تلقائية مضافة حالياً.**';
        }

        let message = '🤖 **الردود التلقائية الحالية:**\n\n';
        
        responseKeys.forEach((key, index) => {
            const response = responses[key];
            message += `${index + 1}. 🔑 **${key}**\n   💬 ${response}\n\n`;
        });

        message += `📊 **الإجمالي:** ${responseKeys.length} رد تلقائي`;
        return message;
    }
    }
