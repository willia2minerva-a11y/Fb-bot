export class ProfileSystem {
  getPlayerStatus(player) {
    const expNeeded = player.level * 100;
    const expProgress = Math.floor((player.exp / expNeeded) * 100);

    return `📊 **حالة ${player.name}**
──────────────
❤️  الصحة: ${player.health}/${player.maxHealth}
💧  المانا: ${player.mana}/${player.maxMana}
✨  المستوى: ${player.level}
⭐  الخبرة: ${player.exp}/${expNeeded} (${expProgress}%)
💰  الذهب: ${player.gold}
⚔️  الهجوم: ${player.attack}
🛡️  الدفاع: ${player.defense}
📍  الموقع: ${player.currentLocation}
🎒  الأغراض: ${player.inventory.length} نوع`;
  }

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
💰 الذهب: ${player.gold}
⚔️ السلاح: ${equippedWeapon}

🎯 **الإحصائيات:**
• ⚔️ المعارك: ${player.stats.battlesWon} فوز
• 🐉 الوحوش: ${player.stats.monstersKilled} قتيل
• 📜 المهام: ${player.stats.questsCompleted} مكتمل
• 🌿 الموارد: ${player.stats.resourcesCollected} مجمع

📍 **الموقع الحالي:** ${player.currentLocation}`;
  }

  getPlayerInventory(player) {
    if (player.inventory.length === 0) {
      return `🎒 **حقيبتك فارغة**\n\nاذهب وجمع بعض الموارد باستخدام أمر \`تجميع\``;
    }

    // تجميع العناصر حسب النوع
    const itemsByType = {};
    player.inventory.forEach(item => {
      if (!itemsByType[item.type]) itemsByType[item.type] = [];
      itemsByType[item.type].push(item);
    });

    let inventoryText = `🎒 **حقيبة ${player.name}**\n\n`;
    
    Object.entries(itemsByType).forEach(([type, items]) => {
      const typeName = this.getTypeName(type);
      inventoryText += `**${typeName}:**\n`;
      items.forEach(item => {
        inventoryText += `  • ${item.name} ×${item.quantity}`;
        if (item.rarity && item.rarity !== 'عادي') {
          inventoryText += ` (${item.rarity})`;
        }
        inventoryText += '\n';
      });
      inventoryText += '\n';
    });

    inventoryText += `💰 **الذهب: ${player.gold} غولد**`;
    
    return inventoryText;
  }

  getPlayerSkills(player) {
    if (player.skills.length === 0) {
      return `🔮 **لا تمتلك أي مهارات بعد**\n\nيمكنك تعلم مهارات جديدة من المدرب في القرية.`;
    }

    let skillsText = `🔮 **مهارات ${player.name}**\n\n`;
    
    player.skills.forEach((skill, index) => {
      skillsText += `${index + 1}. **${skill.name}** (مستوى ${skill.level})\n`;
      skillsText += `   📊 القوة: ${skill.power} | 💧 كلفة المانا: ${skill.manaCost}\n`;
      skillsText += `   🎯 النوع: ${this.getSkillTypeText(skill.type)}\n\n`;
    });

    return skillsText;
  }

  getTypeName(type) {
    const types = {
      'weapon': '⚔️ الأسلحة',
      'armor': '🛡️ الدروع',
      'resource': '🌿 الموارد',
      'potion': '🧪 الجرعات',
      'magic': '🔮 السحر',
      'quest_reward': '🎁 مكافآت المهام'
    };
    return types[type] || type;
  }

  getSkillTypeText(type) {
    const types = {
      'offensive': 'هجومي ⚔️',
      'defensive': 'دفاعي 🛡️',
      'healing': 'علاجي 💚',
      'support': 'مساعد 🔰'
    };
    return types[type] || type;
  }
  }
