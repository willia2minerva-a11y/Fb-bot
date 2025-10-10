// systems/admin/AdminSystem.js
import Player from '../../core/Player.js';
// 💡 إصلاح حاسم: استيراد بيانات العناصر الحقيقية من المسار الصحيح
import { items } from '../../data/items.js';

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
            'اعطاء_مورد': 'اعطاء مورد',
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

        // 🛠️ الإصلاح الحاسم: استخدام items المستوردة من ملف البيانات الحقيقي
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

    // دوال الإدارة الأخرى (يجب أن تبقى كما هي)
    async handleResetPlayer(args, findTargetPlayer) {
        const targetId = args[0];
        if (!targetId) {
            return '❌ الاستخدام: اعادة_بيانات [UserID/PlayerID]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        // حفظ الاسم القديم لتحريره
        const oldName = targetPlayer.name;
        
        // إعادة تعيين البيانات
        targetPlayer.registrationStatus = 'pending';
        targetPlayer.gender = '';
        targetPlayer.name = `Player_${targetPlayer.userId.substring(0, 6)}`;
        targetPlayer.level = 1;
        targetPlayer.gold = 0;
        targetPlayer.health = 100;
        targetPlayer.maxHealth = 100;
        targetPlayer.mana = 20;
        targetPlayer.maxMana = 20;
        targetPlayer.experience = 0;
        targetPlayer.currentLocation = 'forest';
        targetPlayer.inventory = [];
        targetPlayer.equipment = {};
        targetPlayer.skills = { crafting: 1, gathering: 1, combat: 1 };
        targetPlayer.stats = { itemsCrafted: 0, monstersKilled: 0, resourcesGathered: 0 };
        
        await targetPlayer.save();

        return `🔄 تم إعادة تعيين بيانات اللاعب **${oldName}** (${targetId}) بنجاح.\n✅ الاسم القديم **${oldName}** تم تحريره وهو متاح الآن.`;
    }

    async handleSetPlayerName(args, findTargetPlayer) {
        if (args.length < 2) {
            return '❌ الاستخدام: تغيير_اسم [ID] [الاسم الجديد]';
        }
        
        const targetId = args[0];
        const newName = args.slice(1).join(' ');
        
        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        const oldName = targetPlayer.name;
        targetPlayer.name = newName;
        await targetPlayer.save();

        return `📝 تم تغيير اسم اللاعب من **${oldName}** إلى **${newName}** بنجاح.\n✅ الاسم القديم **${oldName}** تم تحريره.`;
    }

    async handleSetPlayerGender(args, findTargetPlayer) {
        if (args.length < 2) {
            return '❌ الاستخدام: تغيير_جنس [ID] [ذكر/أنثى]';
        }
        
        const targetId = args[0];
        const gender = args[1].toLowerCase();
        
        if (gender !== 'ذكر' && gender !== 'أنثى') {
            return '❌ الجنس يجب أن يكون "ذكر" أو "أنثى"';
        }
        
        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        targetPlayer.gender = gender === 'ذكر' ? 'male' : 'female';
        await targetPlayer.save();

        return `👤 تم تغيير جنس اللاعب **${targetPlayer.name}** إلى **${gender}** بنجاح.`;
    }

    async handleBanPlayer(args, findTargetPlayer) {
        if (args.length < 2) {
            return '❌ الاستخدام: حظر_لاعب [ID] [صحيح/خطأ]';
        }
        
        const targetId = args[0];
        const banStatus = args[1].toLowerCase();
        
        if (banStatus !== 'صحيح' && banStatus !== 'خطأ') {
            return '❌ الحالة يجب أن تكون "صحيح" (لحظر) أو "خطأ" (لرفع الحظر)';
        }
        
        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        const shouldBan = banStatus === 'صحيح';
        targetPlayer.banned = shouldBan;
        await targetPlayer.save();

        return `${shouldBan ? '🔴' : '🟢'} تم ${shouldBan ? 'حظر' : 'رفع حظر'} اللاعب **${targetPlayer.name}** بنجاح.`;
    }

    async handleApprovePlayer(args, senderId) {
        if (args.length === 0) {
            // عرض قائمة اللاعبين المنتظرين
            const pendingPlayers = await Player.find({ registrationStatus: 'pending' });
            
            if (pendingPlayers.length === 0) {
                return '✅ لا يوجد لاعبين بانتظار الموافقة.';
            }
            
            let message = `⏳ **اللاعبين المنتظرين للموافقة (${pendingPlayers.length}):**\n\n`;
            
            pendingPlayers.forEach((player, index) => {
                message += `${index + 1}. **${player.name}** (ID: \`${player.userId}\`)\n`;
            });
            
            message += `\n💡 للموافقة: اكتب "موافقة_لاعب [ID]"`;
            return message;
        }
        
        const targetId = args[0];
        const targetPlayer = await Player.findOne({ $or: [{ userId: targetId }, { playerId: targetId }] });
        
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        if (targetPlayer.registrationStatus !== 'pending') {
            return `ℹ️ اللاعب **${targetPlayer.name}** ليس بانتظار الموافقة.`;
        }
        
        targetPlayer.registrationStatus = 'approved';
        await targetPlayer.save();
        
        return `✅ تمت الموافقة على اللاعب **${targetPlayer.name}** (${targetId}) بنجاح.\n📝 يمكنه الآن إكمال التسجيل باختيار الجنس والاسم.`;
    }

    async handleFixRegistration(args, findTargetPlayer) {
        const targetId = args[0];
        if (!targetId) {
            return '❌ الاستخدام: اصلاح_تسجيل [UserID/PlayerID]';
        }

        const targetPlayer = await findTargetPlayer(targetId);
        if (!targetPlayer) {
            return `❌ لم يتم العثور على اللاعب ${targetId}.`;
        }
        
        // إصلاح حالة التسجيل
        if (targetPlayer.registrationStatus === 'pending') {
            targetPlayer.registrationStatus = 'approved';
            await targetPlayer.save();
            return `🔧 تم إصلاح تسجيل اللاعب **${targetPlayer.name}** - تمت الموافقة عليه.`;
        } else if (targetPlayer.registrationStatus === 'approved') {
            if (!targetPlayer.gender) {
                return `🔧 اللاعب **${targetPlayer.name}** يحتاج لاختيار الجنس (ذكر/أنثى).`;
            } else if (!targetPlayer.name || targetPlayer.name.startsWith('Player_')) {
                return `🔧 اللاعب **${targetPlayer.name}** يحتاج لتعيين اسم (اسمي [الاسم]).`;
            } else {
                targetPlayer.registrationStatus = 'completed';
                await targetPlayer.save();
                return `🔧 تم إكمال تسجيل اللاعب **${targetPlayer.name}** بنجاح.`;
            }
        }
        
        return `ℹ️ حالة تسجيل اللاعب **${targetPlayer.name}** هي: ${targetPlayer.registrationStatus}`;
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
            }
