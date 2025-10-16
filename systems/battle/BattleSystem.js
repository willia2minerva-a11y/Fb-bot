// systems/battle/BattleSystem.js
import { monsters } from '../../data/monsters.js';
import { locations } from '../../data/locations.js'; 
import { items } from '../../data/items.js';

export class BattleSystem {
  constructor() {
    console.log('⚔️ نظام المعارك تم تهيئته');
    this.activeBattles = new Map();
    this.allMonsters = monsters;
    this.allLocations = locations;
    this.items = items;
  }
  
  // 🆕 دالة مساعدة لرسم شريط الصحة
  _drawHealthBar(current, max, length = 15, label = 'HP') {
    const percentage = max > 0 ? current / max : 0;
    const filled = Math.round(length * percentage);
    const empty = length - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    const color = percentage > 0.5 ? '🟢' : percentage > 0.2 ? '🟡' : '🔴';
    
    return `${label}: ${color}[${filledBar}${emptyBar}] (${current}/${max})`;
  }

  // دالة مساعدة لاختيار وحش عشوائي في الموقع
  _selectRandomMonster(locationId) {
    const locationInfo = this.allLocations[locationId];

    if (!locationInfo || !locationInfo.monsters || locationInfo.monsters.length === 0) {
      return null;
    }

    const availableMonsterIds = locationInfo.monsters.filter(id => this.allMonsters[id]);
    
    if (availableMonsterIds.length === 0) return null;

    const randomId = availableMonsterIds[Math.floor(Math.random() * availableMonsterIds.length)];
    
    const baseMonster = this.allMonsters[randomId];
    return {
      ...baseMonster,
      health: baseMonster.maxHealth,
      isBoss: baseMonster.isBoss || false
    };
  }

  // 1. بدء المعركة
  async startBattle(player) {
    if (this.activeBattles.has(player.userId)) {
      const activeMonster = this.activeBattles.get(player.userId);
      return {
        error: `⚔️ أنت بالفعل في معركة مع ${activeMonster.name}! صحته: ${activeMonster.health} HP.`
      };
    }
    
    const staminaCost = 5;
    if (!player.useStamina(staminaCost)) {
         const actualStamina = player.getActualStamina();
         return { error: `😩 تحتاج ${staminaCost} نشاط لبدء القتال، لديك ${Math.floor(actualStamina)} فقط.` };
    }
    
    const locationId = player.currentLocation || 'forest';
    const newMonster = this._selectRandomMonster(locationId);

    if (!newMonster) {
      player.stamina = Math.min(player.stamina + staminaCost, player.maxStamina);
      return { error: `❌ لا توجد وحوش متاحة للقتال في ${this.allLocations[locationId]?.name || locationId}.` };
    }
    
    this.activeBattles.set(player.userId, newMonster);
    player.setCooldown('battle', 5);
    await player.save();

    const monsterHPBar = this._drawHealthBar(newMonster.health, newMonster.maxHealth, 10, 'وحش');

    return {
      success: true,
      monster: newMonster,
      message: `⚔️ **بدأت معركة عنيفة!** ظهر **${newMonster.name}** (المستوى ${newMonster.level})!\n\n${monsterHPBar}\n\nاستخدم \`هجوم\` للقتال أو \`هروب\` للمحاولة.`
    };
  }

  // 2. الهجوم
  async attack(player) {
    const monster = this.activeBattles.get(player.userId);
    if (!monster) {
      return { error: '❌ أنت لست في معركة حالياً. استخدم `قتال` لبدء واحدة.' };
    }

    const playerDamage = player.getAttackDamage(this.items);
    const monsterDamage = monster.damage;
    
    monster.health = Math.max(0, monster.health - playerDamage);
    
    let battleLog = `\n💥 هجمت بقوة! ألحقت **${playerDamage}** ضرراً بـ ${monster.name}.`;

    if (monster.health === 0) {
      this.activeBattles.delete(player.userId);
      return await this._handleVictory(player, monster, battleLog);
    }
    
    const isAlive = player.takeDamage(monsterDamage);
    battleLog += `\n💔 **${monster.name}** يهاجم! أصبت بـ **${monsterDamage}** ضرر.`;
    
    if (!isAlive) {
      this.activeBattles.delete(player.userId);
      return await this._handleDefeat(player, monster, battleLog);
    }
    
    const monsterHPBar = this._drawHealthBar(monster.health, monster.maxHealth, 10, 'وحش');
    const playerHPBar = this._drawHealthBar(player.health, player.maxHealth, 10, 'أنت');

    await player.save();
    return {
      success: true,
      message: `⚔️ **المعركة مستمرة!**\n\n${battleLog}\n\n${monsterHPBar}\n${playerHPBar}`
    };
  }

  // 3. محاولة الهروب
  async escape(player) {
    const monster = this.activeBattles.get(player.userId);
    if (!monster) {
      return { error: '❌ أنت لست في معركة حالياً.' };
    }
    
    const escapeStaminaCost = 10;
    if (!player.useStamina(escapeStaminaCost)) {
         const actualStamina = player.getActualStamina();
         return { error: `😩 تحتاج ${escapeStaminaCost} نشاط لمحاولة الهروب! لديك ${Math.floor(actualStamina)} فقط.` };
    }

    const escapeChance = monster.isBoss ? 0.3 : 0.6; 
    
    if (Math.random() < escapeChance) {
      this.activeBattles.delete(player.userId);
      await player.save();
      return {
        success: true,
        message: `🏃‍♂️ هربت بنجاح! تركت **${monster.name}** خلفك. (-${escapeStaminaCost} نشاط)`
      };
    } else {
      const monsterDamage = monster.damage;
      const isAlive = player.takeDamage(monsterDamage);
      
      let message = `❌ فشلت محاولة الهروب! **${monster.name}** يهاجمك.\n💔 أصبت بـ **${monsterDamage}** ضرر. (-${escapeStaminaCost} نشاط)`;

      if (!isAlive) {
        this.activeBattles.delete(player.userId);
        return await this._handleDefeat(player, monster, message);
      }
      
      const playerHPBar = this._drawHealthBar(player.health, player.maxHealth, 10, 'أنت');

      await player.save();
      return {
        success: false,
        message: `${message}\n${playerHPBar}\nحاول الهجوم أو الهروب مرة أخرى!`
      };
    }
  }

  // 4. دالة مساعدة للانتصار
  async _handleVictory(player, monster, log) {
    const expEarned = monster.exp;
    const goldEarned = monster.gold;

    player.addGold(goldEarned);
    player.addExperience(expEarned);
    
    if (player.stats) {
      player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
      player.stats.monstersKilled = (player.stats.monstersKilled || 0) + 1;
    }

    let dropsMessage = '\n🎁 الغنائم المكتسبة:';
    let dropsCount = 0;
    
    if (monster.drops && monster.drops.length > 0) {
        for (const drop of monster.drops) {
            if (Math.random() < drop.chance) {
                const dropItemInfo = this.items[drop.itemId] || { name: drop.itemId, type: 'drop' }; 
                player.addItem(drop.itemId, dropItemInfo.name, dropItemInfo.type, 1); 
                dropsMessage += `\n   • 1 × ${dropItemInfo.name}`; 
                dropsCount++;
            }
        }
    } 
    if (dropsCount === 0) {
        dropsMessage += '\n   • لم تسقط أي عناصر نادرة.';
    }

    await player.save();

    return {
      success: true,
      type: 'victory',
      message: `${log}\n\n🎉 **انتصار ساحق!** تم القضاء على **${monster.name}**!\n\n💰 ربحت: **${goldEarned} غولد**\n✨ خبرة: **+${expEarned}**${dropsMessage}`
    };
  }

  // 5. دالة مساعدة للخسارة
  async _handleDefeat(player, monster, log) {
    const goldLost = player.respawn();
    
    if (player.stats) {
        player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;
    }

    await player.save();
    
    const respawnLocationName = this.allLocations['village']?.name || 'القرية';

    return {
      success: false,
      type: 'defeat',
      message: `${log}\n\n💀 **لقد هُزمت!** **${monster.name}** كان أقوى منك.\n\n خسرت **${goldLost} غولد**.\n تم نقلك إلى **${respawnLocationName}** للتعافي.\n صحتك الآن: ${player.health} HP.`
    };
  }
  }
