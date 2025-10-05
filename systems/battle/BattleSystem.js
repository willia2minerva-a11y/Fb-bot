// systems/battle/BattleSystem.js
import { monsters } from '../../data/monsters.js';
// 💡 ملاحظة: يُفترض أن ملف locations.js يمكن استيراده لتحديد الوحوش المتاحة
import { locations } from '../../data/locations.js'; 

export class BattleSystem {
  constructor() {
    console.log('⚔️ نظام المعارك تم تهيئته');
    // Map لتخزين المعارك النشطة (player.userId -> monster object)
    this.activeBattles = new Map();
    this.allMonsters = monsters;
    this.allLocations = locations;
  }

  // دالة مساعدة لاختيار وحش عشوائي في الموقع
  _selectRandomMonster(locationId) {
    const locationInfo = this.allLocations[locationId];

    if (!locationInfo || !locationInfo.monsters || locationInfo.monsters.length === 0) {
      return null;
    }

    // تصفية الوحوش للتأكد من أنها موجودة في monsters.js
    const availableMonsterIds = locationInfo.monsters.filter(id => this.allMonsters[id]);
    
    if (availableMonsterIds.length === 0) return null;

    const randomId = availableMonsterIds[Math.floor(Math.random() * availableMonsterIds.length)];
    
    // إنشاء نسخة جديدة من بيانات الوحش لتعديل صحته
    const baseMonster = this.allMonsters[randomId];
    return {
      ...baseMonster,
      health: baseMonster.maxHealth, // إعادة تعيين الصحة القصوى
      isBoss: baseMonster.isBoss || false
    };
  }

  // 1. بدء المعركة
  async startBattle(player) {
    // 1.1 التحقق من وجود معركة نشطة
    if (this.activeBattles.has(player.userId)) {
      const activeMonster = this.activeBattles.get(player.userId);
      return {
        error: `⚔️ أنت بالفعل في معركة مع **${activeMonster.name}**! صحته: ${activeMonster.health} HP.`
      };
    }
    
    // 1.2 اختيار وحش للموقع الحالي
    const locationId = player.currentLocation || 'forest';
    const newMonster = this._selectRandomMonster(locationId);

    if (!newMonster) {
      return { error: `❌ لا توجد وحوش متاحة للقتال في ${locationId}.` };
    }
    
    // 1.3 حفظ حالة الوحش
    this.activeBattles.set(player.userId, newMonster);
    
    // 1.4 تعيين فترة تهدئة للقتال
    player.setCooldown('battle', 5); // 5 دقائق فترة تهدئة للدخول في قتال جديد
    await player.save();

    return {
      success: true,
      monster: newMonster,
      message: `⚔️ **بدأت معركة عنيفة!** ظهر **${newMonster.name}** (المستوى ${newMonster.level})!\n\n**صحة الوحش:** ${newMonster.health} HP\n**قوة الوحش:** ${newMonster.damage}\n\nاستخدم \`هجوم\` للقتال أو \`هروب\` للمحاولة.`
    };
  }

  // 2. الهجوم
  async attack(player) {
    // 2.1 التحقق من وجود معركة نشطة
    const monster = this.activeBattles.get(player.userId);
    if (!monster) {
      return { error: '❌ أنت لست في معركة حالياً. استخدم `قتال` لبدء واحدة.' };
    }

    // 2.2 حساب الضرر
    const playerDamage = player.getAttackDamage();
    const monsterDamage = monster.damage;
    
    // 2.3 هجوم اللاعب على الوحش
    monster.health = Math.max(0, monster.health - playerDamage);
    
    let battleLog = `\n💥 هجمت بقوة! ألحقت **${playerDamage}** ضرراً بـ ${monster.name}.`;

    // 2.4 التحقق من فوز اللاعب
    if (monster.health === 0) {
      this.activeBattles.delete(player.userId);
      return await this._handleVictory(player, monster, battleLog);
    }
    
    // 2.5 هجوم الوحش على اللاعب
    const isAlive = player.takeDamage(monsterDamage);
    battleLog += `\n💔 **${monster.name}** يهاجم! أصبت بـ **${monsterDamage}** ضرر.`;
    
    // 2.6 التحقق من خسارة اللاعب
    if (!isAlive) {
      this.activeBattles.delete(player.userId);
      return await this._handleDefeat(player, monster, battleLog);
    }

    // 2.7 استمرار المعركة
    await player.save();
    return {
      success: true,
      message: `⚔️ **المعركة مستمرة!**\n\n${battleLog}\n\n**صحة الوحش:** ${monster.health} HP\n**صحتك:** ${player.health} HP`
    };
  }

  // 3. محاولة الهروب
  async escape(player) {
    const monster = this.activeBattles.get(player.userId);
    if (!monster) {
      return { error: '❌ أنت لست في معركة حالياً.' };
    }

    // عامل الحظ في الهروب (مثلاً: 60% فرصة للوحوش العادية، 30% للزعماء)
    const escapeChance = monster.isBoss ? 0.3 : 0.6; 
    
    if (Math.random() < escapeChance) {
      this.activeBattles.delete(player.userId);
      await player.save();
      return {
        success: true,
        message: `🏃‍♂️ **هربت بنجاح!** تركت **${monster.name}** خلفك.`
      };
    } else {
      // الهروب فشل - الوحش يهاجم قبل أن يتمكن اللاعب من الهروب
      const monsterDamage = monster.damage;
      const isAlive = player.takeDamage(monsterDamage);
      
      let message = `❌ فشلت محاولة الهروب! **${monster.name}** يهاجمك.\n💔 أصبت بـ **${monsterDamage}** ضرر.`;

      if (!isAlive) {
        this.activeBattles.delete(player.userId);
        return await this._handleDefeat(player, monster, message);
      }
      
      await player.save();
      return {
        success: false,
        message: `${message}\n\nصحتك المتبقية: ${player.health} HP. حاول الهجوم أو الهروب مرة أخرى!`
      };
    }
  }

  // 4. دالة مساعدة للانتصار
  async _handleVictory(player, monster, log) {
    // 4.1 حساب المكافآت (EXP، Gold)
    const expEarned = monster.exp;
    const goldEarned = monster.gold;

    player.addGold(goldEarned);
    player.addExperience(expEarned);
    
    if (player.stats) {
      player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
      player.stats.monstersKilled = (player.stats.monstersKilled || 0) + 1;
    }

    // 4.2 جمع الغنائم (Drops)
    let dropsMessage = '\n**🎁 الغنائم المكتسبة:**';
    if (monster.drops && monster.drops.length > 0) {
        for (const drop of monster.drops) {
            if (Math.random() < drop.chance) {
                // يفترض أن itemId هو اسم العنصر أيضاً
                player.addItem(drop.itemId, drop.itemId, 'drop', 1); 
                dropsMessage += `\n   • 1 × ${drop.itemId}`; 
            }
        }
    } else {
        dropsMessage += '\n   • لا شيء إضافي.';
    }

    await player.save();

    return {
      success: true,
      type: 'victory',
      message: `${log}\n\n🎉 **انتصار ساحق!** تم القضاء على **${monster.name}**!\n\n💰 ربحت: **${goldEarned} غولد**\n✨ خبرة: **+${expEarned}**\n${dropsMessage}`
    };
  }

  // 5. دالة مساعدة للخسارة
  async _handleDefeat(player, monster, log) {
    const goldLost = player.respawn(); // دالة respawn تقوم بخسارة الذهب وإعادة تعيين الموقع والصحة
    
    if (player.stats) {
        player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;
    }

    await player.save();

    return {
      success: false,
      type: 'defeat',
      message: `${log}\n\n💀 **لقد هُزمت!** **${monster.name}** كان أقوى منك.\n\n خسرت **${goldLost} غولد**.\n تم نقلك إلى **القرية** للتعافي.\n صحتك الآن: ${player.health} HP.`
    };
  }
}
