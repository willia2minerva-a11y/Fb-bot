export function formatPlayerStats(player) {
  const expNeeded = player.level * 100;
  const expProgress = Math.floor((player.exp / expNeeded) * 100);
  
  return `✨ المستوى: ${player.level}
⭐ الخبرة: ${player.exp}/${expNeeded} (${expProgress}%)
❤️ الصحة: ${player.health}/${player.maxHealth}
💧 المانا: ${player.mana}/${player.maxMana}
💰 الذهب: ${player.gold}
⚔️ الهجوم: ${player.attack}
🛡️ الدفاع: ${player.defense}`;
}

export function formatInventory(items) {
  if (items.length === 0) {
    return "🎒 الحقيبة فارغة";
  }
  
  let result = "🎒 المحتويات:\n";
  items.forEach((item, index) => {
    result += `${index + 1}. ${item.name} ×${item.quantity}\n`;
  });
  
  return result;
}

export function formatBattleResult(player, monster, damage, isVictory) {
  if (isVictory) {
    return `🎉 **انتصار! هزمت ${monster.name}!**\n
💥 الضرر: ${damage}
⭐ الخبرة: +${monster.exp}
💰 الذهب: +${monster.gold}
❤️ صحتك: ${player.health}/${player.maxHealth}`;
  } else {
    return `💀 **هزيمة! لقد هزمك ${monster.name}.**\n
💥 الضرر: ${damage}
🏥 عد إلى القرية للاستشفاء
❤️ صحتك: ${player.health}/${player.maxHealth}`;
  }
}

export function formatItemRarity(rarity) {
  const rarities = {
    'عادي': '⚪',
    'نادر': '🔵', 
    'أسطوري': '🟣',
    'خرافي': '🟠'
  };
  return rarities[rarity] || '⚪';
                 }
