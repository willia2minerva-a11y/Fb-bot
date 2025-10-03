import { monsters } from '../../data/monsters.js';

export class BattleSystem {
  constructor() {
    this.activeBattles = new Map();
  }

  startBattle(player, location) {
    const availableMonsters = monsters.filter(monster => 
      monster.locations.includes(location) && 
      monster.level <= player.level + 2
    );

    if (availableMonsters.length === 0) {
      return { error: `⚠️ لا توجد وحوش مناسبة لمستواك في ${location}` };
    }

    const monster = { ...availableMonsters[Math.floor(Math.random() * availableMonsters.length)] };
    
    this.activeBattles.set(player.userId, {
      monster: monster,
      startTime: new Date()
    });

    return {
      success: true,
      message: `⚔️ **صادفت ${monster.name}!**\n\n📊 المستوى: ${monster.level}\n❤️ الصحة: ${monster.health}\n⚔️ الهجوم: ${monster.attack}\n🛡️ الدفاع: ${monster.defense}\n\nاستخدم \`هجوم\` للقتال أو \`هروب\` للهرب!`,
      monster: monster
    };
  }

  attack(player) {
    const battle = this.activeBattles.get(player.userId);
    if (!battle) {
      return { error: "⚠️ لست في معركة حالياً" };
    }

    // هجوم اللاعب
    const playerDamage = Math.floor(player.attack * (0.8 + Math.random() * 0.4));
    battle.monster.health -= playerDamage;

    let battleText = `⚔️ **هاجمت ${battle.monster.name}!**\n`;
    battleText += `🎯 الضرر: ${playerDamage}\n`;
    battleText += `❤️ صحة الوحش: ${Math.max(0, battle.monster.health)}/${battle.monster.maxHealth}\n\n`;

    // تحقق إذا هزم الوحش
    if (battle.monster.health <= 0) {
      return this.handleVictory(player, battle);
    }

    // هجوم الوحش
    const monsterDamage = Math.floor(battle.monster.attack * (0.7 + Math.random() * 0.3));
    player.health -= monsterDamage;

    battleText += `🐉 **${battle.monster.name} يهاجم!**\n`;
    battleText += `💥 الضرر: ${monsterDamage}\n`;
    battleText += `❤️ صحتك: ${player.health}/${player.maxHealth}\n\n`;

    // تحقق إذا هزم اللاعب
    if (player.health <= 0) {
      return this.handleDefeat(player, battle);
    }

    return {
      success: true,
      message: battleText + `استخدم \`هجوم\` للاستمرار أو \`هروب\` للهرب!`,
      battle: battle
    };
  }

  handleVictory(player, battle) {
    this.activeBattles.delete(player.userId);
    
    const expReward = battle.monster.exp;
    const goldReward = battle.monster.gold;
    
    player.addExp(expReward);
    player.addGold(goldReward);
    player.stats.monstersKilled += 1;
    player.stats.battlesWon += 1;
    player.health = Math.max(1, player.health);

    const leveledUp = player.addExp(expReward);

    let victoryText = `🎉 **انتصار! هزمت ${battle.monster.name}!**\n\n`;
    victoryText += `⭐ الخبرة: +${expReward}\n`;
    victoryText += `💰 الذهب: +${goldReward}\n`;
    victoryText += `🎯 الوحوش المقهورة: ${player.stats.monstersKilled}\n`;

    if (leveledUp.leveledUp) {
      victoryText += `\n🎊 **تهانينا! صعدت للمستوى ${leveledUp.newLevel}!**`;
    }

    return {
      success: true,
      message: victoryText,
      rewards: { exp: expReward, gold: goldReward, leveledUp: leveledUp.leveledUp }
    };
  }

  handleDefeat(player, battle) {
    this.activeBattles.delete(player.userId);
    
    player.health = Math.floor(player.maxHealth * 0.3);
    player.gold = Math.max(0, player.gold - 10);

    return {
      success: false,
      message: `💀 **هزيمة! لقد هزمك ${battle.monster.name}.**\n\n💔 خسرت 10 غولد\n🏥 تم نقلك إلى القرية للاستشفاء\n❤️ صحتك الحالية: ${player.health}/${player.maxHealth}\n\nاستعد وحاول مرة أخرى!`
    };
  }

  escape(player) {
    if (!this.activeBattles.has(player.userId)) {
      return { error: "⚠️ لست في معركة حالياً" };
    }

    this.activeBattles.delete(player.userId);
    return {
      success: true,
      message: `🏃‍♂️ **هربت بنجاح من المعركة!**\n\nعدت إلى ${player.currentLocation} بأمان.`
    };
  }

  isInBattle(playerId) {
    return this.activeBattles.has(playerId);
  }
                                  }
