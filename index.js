import mongoose from 'mongoose';
import 'dotenv/config';
import pkg from 'messenger-api-helper'; // تم تعديل الاستيراد
const { MessengerClient } = pkg; // تم إضافة هذا السطر
import express from 'express';
import CommandHandler from './core/CommandHandler.js';
import { ProfileCardGenerator } from './utils/ProfileCardGenerator.js';
import fs from 'fs';

// تحميل متغيرات البيئة
const MONGODB_URI = process.env.MONGODB_URI;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI || !PAGE_ACCESS_TOKEN) {
  console.error('❌ خطأ: متغيرات البيئة MONGODB_URI و PAGE_ACCESS_TOKEN مطلوبة');
  process.exit(1);
}

// تهيئة Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تهيئة البوت باستخدام MessengerClient
const client = new MessengerClient({
  accessToken: PAGE_ACCESS_TOKEN,
});

// تهيئة نظام البطاقات
const cardGenerator = new ProfileCardGenerator();

// تهيئة معالج الأوامر
let commandHandler;

// الاتصال بقاعدة البيانات
async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ فشل في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
}

// تنظيف الملفات المؤقتة القديمة
function startCleanupInterval() {
  setInterval(() => {
    cardGenerator.cleanupOldFiles();
  }, 3600000); // ساعة واحدة
  console.log('🧹 تم تفعيل نظام تنظيف الملفات المؤقتة');
}

// إرسال رسالة نصية
async function sendTextMessage(senderId, text) {
  try {
    await client.sendText(senderId, text);
    console.log(`✅ تم إرسال رسالة نصية إلى ${senderId}`);
  } catch (error) {
    console.error('❌ خطأ في إرسال الرسالة النصية:', error);
  }
}

// إرسال صورة
async function sendImageMessage(senderId, imagePath, caption = '') {
  try {
    await client.sendAttachment(senderId, 'image', imagePath, {
      isReusable: true,
      caption: caption,
    });
    console.log(`✅ تم إرسال صورة إلى ${senderId}`);
    
    setTimeout(() => {
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🧹 تم حذف الملف المؤقت: ${imagePath}`);
        }
      } catch (deleteError) {
        console.error('❌ خطأ في حذف الملف المؤقت:', deleteError);
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ خطأ في إرسال الصورة:', error);
    
    if (caption) {
      await sendTextMessage(senderId, caption);
    }
  }
}

// معالجة الرسائل الواردة
async function handleMessage(senderId, message) {
  console.log(`📩 رسالة من ${senderId}: ${message}`);
  
  try {
    if (!commandHandler) {
      commandHandler = new CommandHandler();
    }
    
    const sender = {
      id: senderId,
      name: `مغامر-${senderId.slice(-6)}`
    };
    
    const response = await commandHandler.process(sender, message);
    
    if (response && response.type === 'image') {
      await sendImageMessage(senderId, response.path, response.caption);
    } 
    else if (typeof response === 'string') {
      await sendTextMessage(senderId, response);
    }
    else if (response && response.message) {
      await sendTextMessage(senderId, response.message);
    }
    else {
      await sendTextMessage(senderId, '❌ لم أتمكن من معالجة طلبك.');
    }
    
  } catch (error) {
    console.error('❌ خطأ في معالجة الرسالة:', error);
    await sendTextMessage(senderId, '❌ حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
}

// مسار التحقق (لـ webhook)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ تم التحقق من webhook بنجاح');
    res.status(200).send(challenge);
  } else {
    console.log('❌ فشل التحقق من webhook');
    res.sendStatus(403);
  }
});

// مسار استقبال الرسائل
app.post('/webhook', async (req, res) => {
  try {
    const { body } = req;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const event of entry.messaging) {
          if (event.message && event.message.text) {
            await handleMessage(event.sender.id, event.message.text);
          }
          
          if (event.postback && event.postback.payload === 'GET_STARTED') {
            await handleMessage(event.sender.id, 'بدء');
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('❌ خطأ في معالجة webhook:', error);
    res.sendStatus(500);
  }
});

// مسار الصحة (health check)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: '✅ البوت يعمل',
    name: 'مغارة غولد بوت',
    version: '1.0.0'
  });
});

// معالجة الأخطاء غير الملتقطة
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ خطأ غير معالج في:', promise, 'السبب:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ استثناء غير معالج:', error);
  process.exit(1);
});

// الدالة الرئيسية
async function main() {
  console.log('🚀 بدء تشغيل بوت مغارة غولد...');
  
  try {
    await connectDatabase();
    startCleanupInterval();
    
    commandHandler = new CommandHandler();
    console.log('✅ تم تهيئة معالج الأوامر');
    
    app.listen(PORT, () => {
      console.log(`✅ البوت يعمل على المنفذ ${PORT}`);
      console.log('📱 جاهز لاستقبال الرسائل عبر webhook...');
      console.log(`🔗 تأكد من ضبط webhook على: https://your-domain.com/webhook`);
    });
    
  } catch (error) {
    console.error('❌ فشل في بدء تشغيل البوت:', error);
    process.exit(1);
  }
}

// بدء التطبيق
main().catch(console.error);
