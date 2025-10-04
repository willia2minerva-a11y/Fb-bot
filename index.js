import mongoose from 'mongoose';
import 'dotenv/config';
import pkg from 'fb-bot';
const { Bot, Events } = pkg;
import CommandHandler from './core/CommandHandler.js';
import { ProfileCardGenerator } from './utils/ProfileCardGenerator.js';
import fs from 'fs';

// تحميل متغيرات البيئة
const MONGODB_URI = process.env.MONGODB_URI;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

if (!MONGODB_URI || !PAGE_ACCESS_TOKEN) {
  console.error('❌ خطأ: متغيرات البيئة MONGODB_URI و PAGE_ACCESS_TOKEN مطلوبة');
  process.exit(1);
}

// تهيئة البوت
const bot = new Bot({
  accessToken: PAGE_ACCESS_TOKEN,
  verifyToken: VERIFY_TOKEN,
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
  // تنظيف الملفات المؤقتة كل ساعة
  setInterval(() => {
    cardGenerator.cleanupOldFiles();
  }, 3600000); // 3600000 مللي ثانية = ساعة واحدة
  
  console.log('🧹 تم تفعيل نظام تنظيف الملفات المؤقتة');
}

// إرسال رسالة نصية
async function sendTextMessage(senderId, text) {
  try {
    await bot.sendMessage(senderId, { text });
    console.log(`✅ تم إرسال رسالة نصية إلى ${senderId}`);
  } catch (error) {
    console.error('❌ خطأ في إرسال الرسالة النصية:', error);
  }
}

// إرسال صورة
async function sendImageMessage(senderId, imagePath, caption = '') {
  try {
    // قراءة ملف الصورة
    const imageStream = fs.createReadStream(imagePath);
    
    await bot.sendMessage(senderId, {
      attachment: {
        type: 'image',
        payload: { source: imageStream }
      }
    });
    
    console.log(`✅ تم إرسال صورة إلى ${senderId}`);
    
    // إذا كان هناك نص وصفي، أرسله كرسالة منفصلة
    if (caption) {
      await sendTextMessage(senderId, caption);
    }
    
    // حذف الملف المؤقت بعد الإرسال
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
    
    // في حالة فشل إرسال الصورة، أرسل النص البديل
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
      name: `مغامر-${senderId.slice(-6)}` // اسم افتراضي بناءً على ID
    };
    
    const response = await commandHandler.process(sender, message);
    
    // إذا كان الرد عبارة عن صورة
    if (response && response.type === 'image') {
      await sendImageMessage(senderId, response.path, response.caption);
    } 
    // إذا كان الرد نصاً عادياً
    else if (typeof response === 'string') {
      await sendTextMessage(senderId, response);
    }
    // إذا كان الرد كائن به رسالة
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

// معالجة حدث الرسائل
bot.on(Events.MESSAGE, async (event) => {
  const { sender, message } = event;
  
  // تجاهل الرسائل الفارغة
  if (!message || !message.text) {
    return;
  }
  
  await handleMessage(sender.id, message.text);
});

// معالجة حدث النقر على زر البدء
bot.on(Events.POSTBACK, async (event) => {
  const { sender, postback } = event;
  
  if (postback.payload === 'GET_STARTED') {
    await handleMessage(sender.id, 'بدء');
  }
});

// معالجة الأخطاء
bot.on(Events.ERROR, (error) => {
  console.error('❌ خطأ في البوت:', error);
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
    // الاتصال بقاعدة البيانات
    await connectDatabase();
    
    // تفعيل نظام التنظيف التلقائي
    startCleanupInterval();
    
    // تهيئة معالج الأوامر
    commandHandler = new CommandHandler();
    console.log('✅ تم تهيئة معالج الأوامر');
    
    // بدء استقبال الرسائل
    const port = process.env.PORT || 3000;
    bot.start(port);
    
    console.log(`✅ البوت يعمل على المنفذ ${port}`);
    console.log('📱 جاهز لاستقبال الرسائل...');
    
  } catch (error) {
    console.error('❌ فشل في بدء تشغيل البوت:', error);
    process.exit(1);
  }
}

// بدء التطبيق
main().catch(console.error);
