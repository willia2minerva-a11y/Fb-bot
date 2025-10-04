import Player from '../../core/Player.js';

export class ProfileSystem {
    
    getPlayerStatus(player) {
        const expProgress = player.experience || 0;
        const requiredExp = player.level * 100;
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
📍  الموقع: ${player.currentLocation}
🎒  الأغراض: ${player.inventory ? player.inventory.length : 0} نوع`;
    }

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

    getPlayerInventory(player) {
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
    }
    
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
