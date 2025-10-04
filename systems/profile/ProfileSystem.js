export class ProfileSystem {
  getPlayerStatus(player) {
    const expProgress = player.experience || 0;
    const requiredExp = player.level * 100;
    const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
    
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
    
    // إضافة المعدات إذا كانت موجودة
    if (player.equipment) {
      text += `\n⚔️ **المعدات:**\n`;
      text += `• سلاح: ${player.equipment.weapon || 'لا يوجد'}\n`;
      text += `• درع: ${player.equipment.armor || 'لا يوجد'}\n`;
      text += `• أداة: ${player.equipment.tool || 'لا يوجد'}\n`;
    }
    
    return text;
  }
}
