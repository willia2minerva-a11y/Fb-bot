import { monsters } from '../../data/monsters.js';

export class BattleSystem {
  constructor() {
    console.log('⚔️ نظام المعارك تم تهيئته');
    this.activeBattles = new Map();
  }

  startBattle(player, location) {
    try {
      console.log(`🎯 بدء معركة للاعب ${player.name} في ${location}`);
      
      // تأكد من وجود الإحصائيات
      if (!player.stats) {
        player.stats = {
          battlesWon: 0,
          battlesLost: 0,
          monstersKilled: 0
        };
      }
      
      return {
        success: true,
        message: `⚔️ **بدأت مغامرة في ${location}!**\n\nاستخدم \`هجوم\` للقتال أو \`هروب\` للهروب.`
      };
    } catch (error) {
      console.error('❌ خطأ في startBattle:', error);
      return {
        error: '❌ حدث خطأ أثناء بدء المغامرة. حاول مرة أخرى.'
      };
    }
  }

  attack(player) {
    try {
      console.log(`🎯 هجوم من اللاعب ${player.name}`);
      
      // محاكاة معركة بسيطة
      const damage = player.getAttackDamage ? player.getAttackDamage() : 10;
      const goldEarned = Math.floor(Math.random() * 15) + 5;
      const expEarned = Math.floor(Math.random() * 25) + 10;
      
      // تحديث إحصائيات اللاعب
      player.addGold(goldEarned);
      player.addExperience(expEarned);
      
      if (player.stats) {
        player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
        player.stats.monstersKilled = (player.stats.monstersKilled || 0) + 1;
      }
      
      return {
        success: true,
        message: `🎯 **هجمت على الوحوش بنجاح!**\n\n💥 ضرر: ${damage}\n💰 ربحت: ${goldEarned} غولد\n✨ خبرة: ${expEarned}\n\nاستمر في الهجوم أو اهرب!`
      };
    } catch (error) {
      console.error('❌ خطأ في attack:', error);
      return {
        error: '❌ حدث خطأ أثناء الهجوم. حاول مرة أخرى.'
      };
    }
  }

  escape(player) {
    try {
      console.log(`🏃‍♂️ هروب اللاعب ${player.name}`);
      return {
        success: true,
        message: `🏃‍♂️ **هربت بنجاح من المعركة!**\n\nعد إلى المغامرة عندما تكون مستعداً.`
      };
    } catch (error) {
      console.error('❌ خطأ في escape:', error);
      return {
        error: '❌ حدث خطأ أثناء الهروب. حاول مرة أخرى.'
      };
    }
  }
        }
