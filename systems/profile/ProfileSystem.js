export class ProfileSystem {
  getPlayerProfile(player) {
    const expNeeded = player.level * 100;
    const expProgress = Math.floor((player.exp / expNeeded) * 100);
    const equippedWeapon = player.equipment.weapon ? 
      player.inventory.find(item => item.itemId === player.equipment.weapon)?.name : 'لا يوجد';

    return `📋 **بروفايل ${player.name}**
────────────────
✨ المستوى: ${player.level} 
⭐ الخبرة: ${player.exp}/${expNeeded} (${expProgress}%)
❤️ الصحة: ${player.health}/${player.maxHealth}
💧 المانا: ${player.mana}/${player.maxMana}
💰 الذهب: ${player.gold} غولد
⚔️ السلاح: ${equippedWeapon}

🎯 **الإحصائيات:**
• ⚔️ المعارك: ${player.stats.battlesWon} فوز
• 🐉 الوحوش: ${player.stats.monstersKilled} قتيل
• 📜 المهام: ${player.stats.questsCompleted} مكتمل
• 🌿 الموارد: ${player.stats.resourcesCollected} مجمع

📍 **الموقع الحالي:** ${player.currentLocation}`;
  }

  getPlayerStatus(player) {
    const expNeeded = player.level * 100;
    const expProgress = Math.floor((player.exp / expNeeded) * 100);

    return `📊 **حالة ${player.name}**
──────────────
❤️  الصحة: ${player.health}/${player.maxHealth}
💧  المانا: ${player.mana}/${player.maxMana}
✨  المستوى: ${player.level}
⭐  الخبرة: ${player.exp}/${expNeeded} (${expProgress}%)
💰  الذهب: ${player.gold} غولد
⚔️  الهجوم: ${player.attack}
🛡️  الدفاع: ${player.defense}
📍  الموقع: ${player.currentLocation}
🎒  الأغراض: ${player.inventory.length} نوع`;
  }

  getPlayerInventory(player) {
    if (player.inventory.length === 0) {
      return `🎒 **حقيبتك فارغة**\n\nاذهب وجمع بعض الموارد باستخدام أمر \`تجميع\``;
    }

    let inventoryText = `🎒 **حقيبة ${player.name}**\n\n`;
    
    // تجميع العناصر حسب النوع
    const itemsByType = {};
    player.inventory.forEach(item => {
      if (!itemsByType[item.type]) itemsByType[item.type] = [];
      itemsByType[item.type].push(item);
    });

    Object.entries(itemsByType).forEach(([type, items]) => {
      inventoryText += `**${this.getTypeName(type)}:**\n`;
      items.forEach(item => {
        inventoryText += `  • ${item.name} ×${item.quantity}\n`;
      });
      inventoryText += '\n';
    });

    inventoryText += `💰 **الذهب: ${player.gold} غولد**`;
    
    return inventoryText;
  }

  getTypeName(type) {
    const types = {
      'weapon': '⚔️ الأسلحة',
      'armor': '🛡️ الدروع',
      'resource': '🌿 الموارد',
      'potion': '🧪 الجرعات',
      'magic': '🔮 السحر'
    };
    return types[type] || type;
  }
}
