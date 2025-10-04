// ⚠️ تم تعديل المسار لاستيراد Player.js من مجلد core/
import Player from '../../core/Player.js';
import 'dotenv/config'; 
// إذا كنت تستخدم ProfileCardGenerator في هذا الملف، يجب أن يكون استيرادها موجودًا هنا.
// سنفترض أن ProfileCardGenerator يتم استخدامه في CommandHandler فقط.

export class ProfileSystem {
    
    // دالة لعرض حالة اللاعب (Status)
    getPlayerStatus(player) {
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
    }

    // دالة لعرض بروفايل اللاعب (Text Profile)
    getPlayerProfile(player) {
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
    }

    // دالة لعرض حقيبة اللاعب (Inventory)
    getPlayerInventory(player) {
        if (!player.inventory || player.inventory.length === 0) {
            return `🎒 **حقيبة ${player.name}**\n\nالحقيبة فارغة`;
        }
        
        let text = `🎒 **حقيبة ${player.name}**\n\n`;
        player.inventory.forEach(item => {
            text += `• ${item.name} ×${item.quantity}\n`;
        });
        
        // إضافة المعدات إذا كانت موجودة
        if (player.equipment) {
            text += `\n⚔️ **المعدات:**\n`;
            text += `• سلاح: ${player.equipment.weapon || 'لا يوجد'}\n`;
            text += `• درع: ${player.equipment.armor || 'لا يوجد'}\n`;
            text += `• أداة: ${player.equipment.tool || 'لا يوجد'}\n`;
        }
        
        return text;
    }
    
    // 🆕 دالة تغيير الاسم الجديدة (تُستخدم بواسطة أمر 'تغيير_اسم')
    async changeName(player, args, senderId) {
        const ADMIN_ID = process.env.ADMIN_PSTD;
        
        // 1. التحقق من صلاحية المدير
        if (senderId !== ADMIN_ID) {
            return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
        }

        let newName = args.join(' ').trim();
        
        if (!newName) {
            return 'يرجى تحديد اسم جديد. مثال: تغيير_اسم JohnDoe';
        }

        let targetPlayer = player;
        
        // 2. التحقق مما إذا كان المدير يغير اسم لاعب آخر (الحجة الأولى هي ID طويل)
        // إذا كان طول الحجة الأولى كبيراً ويحتوي على أرقام فقط، نفترض أنه ID
        if (args.length > 1 && args[0].length > 10 && !isNaN(args[0])) { 
            const targetId = args[0];
            targetPlayer = await Player.findOne({ userId: targetId });
            
            if (!targetPlayer) {
                return `❌ لم يتم العثور على لاعب بالمعرف: ${targetId}`;
            }
            newName = args.slice(1).join(' ').trim();
        }

        if (!newName) {
            return 'يرجى تحديد اسم جديد بعد المعرف (إذا كنت تغير اسم لاعب آخر).';
        }

        // 3. تطبيق التغيير
        const oldName = targetPlayer.name;
        targetPlayer.name = newName;
        // لا نحفظ هنا، دالة CommandHandler.process ستقوم بذلك بشكل تلقائي

        console.log(`✅ تم تغيير اسم اللاعب ${oldName} إلى ${newName}`);
        
        return `✅ تم تحديث اسم اللاعب ${oldName} بنجاح إلى: **${newName}**`;
    }
    }
