import Player from './Player.js';
import CommandHandler from './CommandHandler.js';
import { TimeSystem } from '../systems/time/TimeSystem.js';

export default class Game {
  constructor() {
    this.commandHandler = new CommandHandler();
    this.timeSystem = new TimeSystem();
    this.isRunning = false;
    this.startedAt = null;
    
    // تهيئة تحديث الوقت التلقائي
    this.setupTimeUpdates();
    
    console.log('🎮 لعبة مغارة غولد تم تهيئتها');
  }

  async handleMessage(sender, message) {
    try {
      // تحديث وقت اللعبة
      this.timeSystem.update();
      
      const response = await this.commandHandler.process(sender, message);
      return response;
    } catch (error) {
      console.error('❌ خطأ في معالجة الرسالة:', error);
      return '⚠️ حدث خطأ غير متوقع في اللعبة. حاول مرة أخرى.';
    }
  }

  setupTimeUpdates() {
    // تحديث وقت اللعبة كل دقيقة
    setInterval(() => {
      this.timeSystem.update();
    }, 60000); // كل دقيقة حقيقية

    // حفظ إحصائيات اللعبة كل 5 دقائق
    setInterval(() => {
      this.saveGameStats();
    }, 5 * 60 * 1000);
  }

  async saveGameStats() {
    try {
      const playerCount = await Player.countDocuments();
      const totalBattles = await Player.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.battlesWon' } } }
      ]);
      
      console.log(`📊 إحصائيات اللعبة: ${playerCount} لاعب, ${totalBattles[0]?.total || 0} معركة`);
    } catch (error) {
      console.error('❌ خطأ في حفظ إحصائيات اللعبة:', error);
    }
  }

  async getGameStats() {
    try {
      const totalPlayers = await Player.countDocuments();
      const activePlayers = await Player.countDocuments({
        lastAction: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      const topPlayers = await Player.find()
        .sort({ level: -1, exp: -1 })
        .limit(5)
        .select('name level exp stats.battlesWon');

      return {
        totalPlayers,
        activePlayers,
        topPlayers,
        gameTime: this.timeSystem.getCurrentTime(),
        uptime: this.startedAt ? Date.now() - this.startedAt : 0
      };
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات اللعبة:', error);
      return null;
    }
  }

  start() {
    this.isRunning = true;
    this.startedAt = Date.now();
    console.log('🚀 لعبة مغارة غولد بدأت التشغيل!');
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 لعبة مغارة غولد توقفت عن التشغيل');
  }

  // دالة للمساعدة في التطوير
  async resetPlayer(userId) {
    try {
      await Player.findOneAndDelete({ userId });
      return '✅ تم إعادة تعيين اللاعب';
    } catch (error) {
      console.error('❌ خطأ في إعادة تعيين اللاعب:', error);
      return '❌ فشل في إعادة تعيين اللاعب';
    }
  }
        }
