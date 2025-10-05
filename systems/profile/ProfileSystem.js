// systems/profile/ProfileSystem.js

import Player from '../../core/Player.js';
import { ProfileCardGenerator } from '../../utils/ProfileCardGenerator.js'; // ⬅️ استيراد المولد
import fs from 'fs/promises'; // لاستخدامه في حذف الملف المؤقت

const cardGenerator = new ProfileCardGenerator(); // إنشاء مثيل للمولد

export class ProfileSystem {
    
    // دالة لعرض حالة اللاعب (Status) - الكود الأصلي
    getPlayerStatus(player) {
        const expProgress = player.experience || 0;
        const requiredExp = (player.level || 1) * 100;
        const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
        
        const attackDamage = player.getAttackDamage ? player.getAttackDamage() : 10;
        const defense = player.getDefense ? player.getDefense() : 5;

        return `📊 **حالة ${player.name}**
──────────────
❤️  الصحة: ${player.health}/${player.maxHealth}
✨  المستوى: ${player.level}
⭐  الخبرة: ${expProgress}/${requiredExp} (${expPercentage}%)
💰  الذهب: ${player.gold}
⚔️  الهجوم: ${attackDamage}
🛡️  الدفاع: ${defense}
📍  الموقع: ${player.currentLocation || 'القرية'}
🎒  الأغراض: ${player.inventory ? player.inventory.length : 0} نوع`;
    }

    // دالة لعرض حقيبة اللاعب (Inventory) - الكود الأصلي
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
    
    // دالة لعرض بروفايل اللاعب (Text Profile) - الكود الأصلي
    getPlayerProfile(player) {
        const expProgress = player.experience || 0;
        const requiredExp = (player.level || 1) * 100;
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

📍 **الموقع الحالي:** ${player.currentLocation || 'القرية'}`;
    }
    
    // 🆕 دالة جديدة لإنشاء كائن المرفق (الصورة)
    /**
     * ينشئ بطاقة البروفايل المصوّرة ويرسلها.
     * @param {Object} player - كائن اللاعب (يجب أن يحتوي على .gender).
     * @returns {Promise<Object>} - يعيد {success: bool, attachment: Object, filePath: string}
     */
    async getProfileCardAttachment(player) {
        if (!player) {
            return { error: '❌ لم يتم العثور على بيانات اللاعب.' };
        }
        
        try {
            // 1. إنشاء البطاقة (الصورة)
            const imagePath = await cardGenerator.generateCard(player);

            // 2. تجهيز كائن المرفق (attachment object)
            const attachment = {
                type: 'image',
                path: imagePath, // المسار المحلي للملف
            };

            console.log(`✅ تم تجهيز بطاقة البروفايل للاعب ${player.name} للإرسال.`);
            
            // 3. إرجاع المرفق
            return { success: true, attachment: attachment, filePath: imagePath };
            
        } catch (error) {
            console.error('❌ خطأ في إنشاء أو تجهيز البطاقة المصوّرة:', error);
            return { error: '❌ فشلت عملية إنشاء بطاقة البروفايل المصوّرة.' };
        }
    }
    
    /**
     * دالة تنظيف الملف المؤقت
     * يجب استدعاء هذه الدالة بعد إرسال الصورة بنجاح بواسطة CommandHandler
     */
    async cleanupProfileCard(filePath) {
        if (filePath) {
            try {
                await fs.unlink(filePath);
                console.log(`🧹 تم حذف الملف المؤقت: ${filePath}`);
            } catch (error) {
                console.error('❌ فشل حذف ملف البطاقة المؤقت:', error.message);
            }
        }
    }
    
    // دالة تغيير الاسم - الكود الأصلي
    async changeName(player, args, senderId) {
        const ADMIN_PSID = process.env.ADMIN_PSID;
        
        if (senderId !== ADMIN_PSID) {
            return '❌ ليس لديك الصلاحية لاستخدام هذا الأمر.';
        }

        let newName = args.join(' ').trim();
        
        if (!newName) {
            return 'يرجى تحديد اسم جديد. مثال: تغيير_اسم JohnDoe';
        }

        let targetPlayer = player;
        
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

        // التحقق من صحة الاسم
        if (newName.length < 3 || newName.length > 9) {
            return '❌ الاسم يجب أن يكون بين 3 إلى 9 أحرف.';
        }

        if (!/^[a-zA-Z]+$/.test(newName)) {
            return '❌ الاسم يجب أن يحتوي على أحرف إنجليزية فقط.';
        }

        // التحقق من عدم استخدام الاسم
        const existingPlayer = await Player.findOne({ 
            name: new RegExp(`^${newName}$`, 'i'),
            userId: { $ne: targetPlayer.userId }
        });

        if (existingPlayer) {
            return '❌ هذا الاسم مستخدم مسبقاً. يرجى اختيار اسم آخر.';
        }

        const oldName = targetPlayer.name;
        targetPlayer.name = newName;

        console.log(`✅ تم تغيير اسم اللاعب ${oldName} إلى ${newName}`);
        
        return `✅ تم تحديث اسم اللاعب ${oldName} بنجاح إلى: **${newName}**`;
    }
}
