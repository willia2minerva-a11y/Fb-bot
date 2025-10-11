// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
// 💡 ملاحظة: يجب التأكد من وجود ملف items.js
const items = {
    'wooden_bow': { name: 'قوس خشبي', type: 'weapon' },
    'iron_bar': { name: 'سبيكة حديد', type: 'resource' },
    'wyvern_wings': { name: 'أجنحة الوايفرن', type: 'accessory' },
    'hallowed_bar': { name: 'سبيكة مقدسة', type: 'resource' } 
}; // Placeholder


export class AdminSystem {
    constructor() {
        this.adminCommands = new Map();
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

    async setupAdminPlayer(userId, userName) {
        try {
            let player = await Player.findOne({ userId });
            
            if (!player) {
                player = await Player.createNew(userId, userName);
            }
            
            // 🆕 تعيين الـ ID التسلسلي إذا لم يكن معيناً
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
            'اعطاء_مورد': 'اعطاء مورد', // 🛠️ تم تحديث الاسم البرمجي
            'زيادة_صحة': 'زيادة صحة',
            'زيادة_مانا': 'زيادة مانا',
            'اضف_رد': 'إضافة رد',
            'ازل_رد': 'إزالة رد',
            'عرض_الردود': 'عرض الردود',
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

🎁 **أوامر المنح (المنح):**
• اعطاء_ذهب [ID] [الكمية]: يمنح ذهباً.
• اعطاء_مورد [ID] [اسم_العنصر] [الكمية]: يمنح عنصر أو سلاح.
• زيادة_صحة [ID] [الكمية]: يزيد الحد الأقصى للصحة.
• زيادة_مانا [ID] [الكمية]: يزيد الحد الأقصى للمانا.

`;
    }

    async handleAdminCommand(command, args, senderId, player, itemMap) {
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
            case 'اعطاء_مورد': return await this.handleGiveItem(args, findTargetPlayer, itemMap); 
            case 'زيادة_صحة': return await this.handleIncreaseStat(args, 'maxHealth', findTargetPlayer);
            case 'زيادة_مانا': return await this.handleIncreaseStat(args, 'maxMana', findTargetPlayer);
            default: return '❌ أمر مدير غير معروف';
        }
    }
    
    // ===================================
    // 1. أوامر الإدارة الأساسية
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

        // حذف اللاعب بالكامل لتحرير الاسم
        await targetPlayer.deleteOne();
        
        // إعادة إنشاء كائن جديد بـ 'pending'
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


    // 🛠️ الإصلاح النهائي لـ دالة إعطاء مورد (handleGiveItem)
    async handleGiveItem(args, findTargetPlayer, itemMap) { 
        // نحتاج على الأقل 3 وسائط: [ID], [اسم], [كمية] 
        if (args.length < 3) {
            return `❌ صيغة خاطئة. الاستخدام: اعطاء_مورد [ID] [اسم_العنصر] [الكمية]`;
        }
        
        const targetId = args[0]; // الوسيط الأول هو ID اللاعب
        const quantity = parseInt(args[args.length - 1], 10); // الوسيط الأخير هو الكمية
        
        // استخراج الاسم المركب: كل شيء بين ID اللاعب والكمية
        const rawItemNameArray = args.slice(1, args.length - 1);
        const rawItemName = rawItemNameArray.join(' ').toLowerCase();

        // 🛠️ التحقق من الصلاحية
        const itemId = itemMap[rawItemName] || rawItemName;
        const itemInfo = items[itemId]; // استخدام items Placeholder من الأعلى

        if (!itemInfo || isNaN(quantity) || quantity <= 0) {
            // رسالة خطأ جديدة مع القيمة التي لم يتم التعرف عليها
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
                              }
