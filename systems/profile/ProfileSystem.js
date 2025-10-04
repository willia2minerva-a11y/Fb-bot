import Player from '../../models/Player.js';
import { ProfileCardGenerator } from '../../utils/ProfileCardGenerator.js';
import 'dotenv/config'; 

const cardGenerator = new ProfileCardGenerator();

// تم تحويل دوال النظام إلى دوال أوامر ليتم استيرادها مباشرة في CommandHandler
export default {

    // دالة مساعدة لإنشاء رسالة حالة اللاعب (Status Message)
    'حالة': (player) => {
        const expProgress = player.experience || 0;
        const requiredExp = player.level * 100;
        const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
        
        // يجب أن تكون getAttackDamage دالة موجودة في نموذج اللاعب
        const attackDamage = player.getAttackDamage ? player.getAttackDamage() : 10;
        const defense = player.level * 2;
    
        return `📊 **حالة ${player.name}**
──────────────
❤️  الصحة: ${player.health}/${player.maxHealth}
✨  المستوى: ${player.level}
⭐  الخبرة: ${expProgress}/${requiredExp} (${expPercentage}%)
💰  الذهب: ${player.gold}
⚔️  الهجوم: ${attackDamage}
🛡️  الدفاع: ${defense}
📍  الموقع: ${player.currentLocation}
🎒  الأغراض: ${player.inventory ? player.inventory.length : 0} نوع`;
    },

    // دالة مساعدة لإنشاء رسالة البروفايل (Profile Message)
    'بروفايل_نصي': (player) => {
        const expProgress = player.experience || 0;
        const requiredExp = player.level * 100;
        const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
        
        const monstersKilled = player.stats?.monstersKilled || 0;
        const questsCompleted = player.stats?.questsCompleted || 0;
        const resourcesGathered = player.stats?.resourcesGathered || 0;
        const battlesWon = player.stats?.battlesWon || 0;
    
        const weapon = player.equipment?.weapon ? player.equipment.weapon : 'لا يوجد';
    
        return `📋 **بروفايل ${player.name}**
────────────────
✨ المستوى: ${player.level} 
⭐ الخبرة: ${expProgress}/${requiredExp} (${expPercentage}%)
❤️ الصحة: ${player.health}/${player.maxHealth}
💰 الذهب: ${player.gold}
⚔️ السلاح: ${weapon}
    
🎯 **الإحصائيات:**
• ⚔️ المعارك: ${battlesWon} فوز
• 🐉 الوحوش: ${monstersKilled} قتيل
• 📜 المهام: ${questsCompleted} مكتمل
• 🌿 الموارد: ${resourcesGathered} مجمع
    
📍 **الموقع الحالي:** ${player.currentLocation}`;
    },

    // دالة مساعدة لإنشاء رسالة الحقيبة (Inventory Message)
    'حقيبة': (player) => {
        if (!player.inventory || player.inventory.length === 0) {
            return `🎒 **حقيبة ${player.name}**\n\nالحقيبة فارغة`;
        }
        
        let text = `🎒 **حقيبة ${player.name}**\n\n`;
        player.inventory.forEach(item => {
            text += `• ${item.name} ×${item.quantity}\n`;
        });
        
        if (player.equipment) {
            text += `\n⚔️ **المعدات:**\n`;
            text += `• سلاح: ${player.equipment.weapon || 'لا يوجد'}\n`;
            text += `• درع: ${player.equipment.armor || 'لا يوجد'}\n`;
            text += `• أداة: ${player.equipment.tool || 'لا يوجد'}\n`;
        }
        
        return text;
    },

    // 🆕 الأمر 'بروفايلي' الذي يرسل البطاقة
    'بروفايلي': async (player) => {
        try {
            console.log('📋 تنفيذ أمر بروفايل البطاقة...');
            
            const imagePath = await cardGenerator.generateCard(player);

            return {
                type: 'image',
                path: imagePath,
                caption: `📋 هذه بطاقة بروفايلك يا ${player.name}!` 
            };
        } catch (error) {
            console.error('❌ خطأ في إنشاء بطاقة البروفايل:', error);
            return '❌ حدث خطأ أثناء إنشاء بطاقة البروفايل. يرجى إبلاغ المدير.';
        }
    },
    
    // 🆕 الأمر الجديد: تغيير الاسم (للمدير فقط)
    'تغيير_اسم': async (player, args, senderId) => {
        const ADMIN_ID = process.env.ADMIN_PSTD;
        
        if (senderId !== ADMIN_ID) {
            return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
        }

        let newName = args.join(' ').trim();
        
        if (!newName) {
            return 'يرجى تحديد اسم جديد. مثال: تغيير_اسم JohnDoe';
        }

        let targetPlayer = player;
        
        // يمكن للمدير تغيير اسمه أو اسم لاعب آخر
        if (args.length > 1 && args[0].length > 10 && !isNaN(args[0])) { 
            const targetId = args[0];
            targetPlayer = await Player.findOne({ userId: targetId });
            
            if (!targetPlayer) {
                return `❌ لم يتم العثور على لاعب بالمعرف: ${targetId}`;
            }
            newName = args.slice(1).join(' ').trim();
        }

        if (!newName) {
            return 'يرجى تحديد اسم جديد بعد المعرف.';
        }

        const oldName = targetPlayer.name;
        targetPlayer.name = newName;
        await targetPlayer.save();

        console.log(`✅ تم تغيير اسم اللاعب ${oldName} إلى ${newName}`);
        
        return `✅ تم تحديث اسم اللاعب ${oldName} بنجاح إلى: **${newName}**`;
    }
};
