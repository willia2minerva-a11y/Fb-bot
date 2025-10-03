import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Game from './core/Game.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// متغيرات البيئة
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mughera-gold';
const NODE_ENV = process.env.NODE_ENV || 'development';

// تهيئة اللعبة
const game = new Game();

// الاتصال بقاعدة البيانات
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ متصل بقاعدة البيانات بنجاح');
    game.start();
  })
  .catch(err => {
    console.error('❌ فشل في الاتصال بقاعدة البيانات:', err);
    process.exit(1);
  });

// ========== Routes ==========

// ويب هوك لاستقبال الرسائل من الماسنجر
app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 استقبال ويب هوك:', req.body);
    
    const { sender, message } = req.body;
    
    if (!sender || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'بيانات غير مكتملة' 
      });
    }

    const response = await game.handleMessage(sender, message);
    
    res.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ خطأ في ويب هوك:', error);
    res.status(500).json({ 
      success: false, 
      error: 'خطأ داخلي في السيرفر' 
    });
  }
});

// صفحة الرئيسية
app.get('/', (req, res) => {
  res.json({ 
    message: '🕹️ مغارة غولد - البوت يعمل!',
    version: '1.0.0',
    status: 'active',
    environment: NODE_ENV
  });
});

// صفحة الصحة
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const gameStats = await game.getGameStats();
    
    res.json({ 
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      gameStats
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// إحصائيات اللعبة
app.get('/stats', async (req, res) => {
  try {
    const stats = await game.getGameStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// إدارة اللاعبين (للتطوير)
app.post('/admin/reset-player', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'معرف اللاعب مطلوب'
      });
    }

    const result = await game.resetPlayer(userId);
    res.json({
      success: true,
      message: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// صفحة 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'الصفحة غير موجودة'
  });
});

// معالجة الأخطاء
app.use((error, req, res, next) => {
  console.error('❌ خطأ غير متوقع:', error);
  res.status(500).json({
    success: false,
    error: 'حدث خطأ غير متوقع'
  });
});

// بدء السيرفر
app.listen(PORT, () => {
  console.log(`
🎮 ===================================
   مغارة غولد تعمل بنجاح!
   🚪 المنفذ: ${PORT}
   🌍 البيئة: ${NODE_ENV}
   ⏰ الوقت: ${new Date().toLocaleString()}
====================================
  `);
});

// إغلاق نظيف
process.on('SIGINT', async () => {
  console.log('🛑 إغلاق اللعبة...');
  game.stop();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 إغلاق اللعبة...');
  game.stop();
  await mongoose.connection.close();
  process.exit(0);
});

export default app;
