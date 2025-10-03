import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Game from './core/Game.js';

// تحميل متغيرات البيئة
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// متغيرات البيئة
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ADMIN_PSTD = process.env.ADMIN_PSTD;

// التحقق من وجود المتغيرات الأساسية
if (!MONGODB_URI) {
  console.error('❌ خطأ: MONGODB_URI مطلوب');
  process.exit(1);
}

if (!PAGE_ACCESS_TOKEN) {
  console.warn('⚠️  تحذير: PAGE_ACCESS_TOKEN غير موجود - واجهة Messenger لن تعمل');
}

// تهيئة اللعبة
const game = new Game();

// الاتصال بقاعدة البيانات
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ متصل بقاعدة البيانات بنجاح');
  game.start();
})
.catch(err => {
  console.error('❌ فشل في الاتصال بقاعدة البيانات:', err);
  process.exit(1);
});

// ========== Routes ==========

// ويب هوك التحقق من فيسبوك
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // التحقق من التوكن
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ تم التحقق من ويب هوك بنجاح');
      res.status(200).send(challenge);
    } else {
      console.log('❌ فشل في التحقق من ويب هوك');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// استقبال الرسائل من Messenger
app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 استقبال ويب هوك:', JSON.stringify(req.body, null, 2));

    // يجب أن يكون الطلب من فيسبوك
    if (req.body.object === 'page') {
      for (const entry of req.body.entry) {
        for (const messagingEvent of entry.messaging) {
          await handleMessage(messagingEvent);
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ خطأ في معالجة ويب هوك:', error);
    res.sendStatus(500);
  }
});

// معالجة الرسائل من المستخدمين
async function handleMessage(event) {
  try {
    // تجاهل الرسائل التي ليست نصية
    if (!event.message || !event.message.text) {
      return;
    }

    const senderId = event.sender.id;
    const messageText = event.message.text.trim();
    
    console.log(`💬 رسالة من ${senderId}: ${messageText}`);

    // إعداد بيانات المرسل
    const sender = {
      id: senderId,
      name: `مغامر-${senderId.slice(-6)}` // اسم افتراضي
    };

    // معالجة الرسالة عبر نظام اللعبة
    const response = await game.handleMessage(sender, messageText);
    
    // إرسال الرد إلى المستخدم
    if (response) {
      await sendMessage(senderId, response);
    }

  } catch (error) {
    console.error('❌ خطأ في معالجة الرسالة:', error);
    // إرسال رسالة خطأ للمستخدم
    await sendMessage(event.sender.id, '⚠️ حدث خطأ غير متوقع. حاول مرة أخرى.');
  }
}

// إرسال رسالة إلى Messenger
async function sendMessage(recipientId, messageText) {
  try {
    if (!PAGE_ACCESS_TOKEN) {
      console.warn('⚠️  PAGE_ACCESS_TOKEN غير موجود - لا يمكن إرسال الرسائل');
      return;
    }

    const messageData = {
      recipient: { id: recipientId },
      message: { text: messageText }
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ خطأ في إرسال الرسالة:', data.error);
    } else {
      console.log('✅ تم إرسال الرسالة بنجاح');
    }

    return data;
  } catch (error) {
    console.error('❌ خطأ في إرسال الرسالة:', error);
  }
}

// صفحة الرئيسية
app.get('/', (req, res) => {
  res.json({ 
    message: '🕹️ مغارة غولد - البوت يعمل!',
    version: '1.0.0',
    status: 'active',
    environment: process.env.NODE_ENV,
    features: {
      messenger: !!PAGE_ACCESS_TOKEN,
      database: !!MONGODB_URI,
      admin: !!ADMIN_PSTD
    }
  });
});

// صفحة الصحة
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'healthy',
      database: dbStatus,
      messenger: !!PAGE_ACCESS_TOKEN,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// صفحة إدارة المدير
app.get('/admin', (req, res) => {
  const adminToken = req.query.token;
  
  if (adminToken === ADMIN_PSTD) {
    res.json({
      status: 'authorized',
      message: 'مرحباً بالمدير!',
      stats: {
        players: 'N/A', // يمكن إضافة إحصائيات حقيقية
        uptime: process.uptime()
      }
    });
  } else {
    res.status(401).json({
      status: 'unauthorized',
      message: 'رمز المدير غير صحيح'
    });
  }
});

// بدء السيرفر
app.listen(PORT, () => {
  console.log(`
🎮 ===================================
   مغارة غولد تعمل بنجاح!
   🚪 المنفذ: ${PORT}
   🌍 البيئة: ${process.env.NODE_ENV}
   🤖 Messenger: ${PAGE_ACCESS_TOKEN ? 'مفعل' : 'معطل'}
   🗄️  Database: ${MONGODB_URI ? 'متصل' : 'غير متصل'}
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

export default app;
