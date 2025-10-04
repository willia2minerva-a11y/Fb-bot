import canvas from 'canvas';
import fs from 'fs';
import path from 'path';

const { createCanvas, loadImage, registerFont } = canvas;

// 🆕 تحديد المسار الأساسي للمشروع لضمان العثور على مجلد assets
// هذا يحل مشكلة المسارات النسبية في بيئات التشغيل المختلفة.
const BASE_DIR = path.resolve();

export class ProfileCardGenerator {
  constructor() {
    // محاولة تسجيل الخط العربي
    try {
      const fontPath = path.join(BASE_DIR, 'assets', 'fonts', 'arabic-font.ttf');
      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'Arabic' });
        console.log('✅ تم تسجيل الخط العربي بنجاح.');
      } else {
        console.log('⚠️ لم يتم العثور على ملف الخط العربي في المسار المحدد: assets/fonts/arabic-font.ttf');
      }
    } catch (error) {
      console.log('⚠️ خطأ في تسجيل الخط، سيتم استخدام الخط الافتراضي:', error.message);
    }
  }

  // حساب الـ Tier بناءً على المستوى والإحصائيات
  calculateTier(player) {
    const level = player.level || 1;
    const totalStats = (player.stats?.battlesWon || 0) + (player.stats?.monstersKilled || 0);
    
    if (level >= 50 && totalStats >= 1000) return 'SS';
    if (level >= 40 && totalStats >= 500) return 'S';
    if (level >= 30 && totalStats >= 200) return 'A';
    if (level >= 20 && totalStats >= 100) return 'B';
    if (level >= 10 && totalStats >= 50) return 'C';
    if (level >= 5 && totalStats >= 20) return 'D';
    return 'E';
  }

  // تحديد نوع البطاقة بناءً على الجنس
  determineGender(name) {
    // منطق بسيط لتحديد الجنس
    const femaleIndicators = ['ة', 'اء', 'ى', 'آء', 'ه'];
    const lastChar = name.trim().slice(-1);
    
    if (femaleIndicators.includes(lastChar)) {
      return 'female';
    }
    return 'male';
  }

  // ❗ الدالة الرئيسية لإنشاء البطاقة، اسمها يتوافق مع استدعاء CommandHandler
  async generateCard(player) {
    let filePath = null;
    
    try {
      const gender = this.determineGender(player.name);
      const templateFileName = gender === 'female' 
        ? 'profile_card_female.png'
        : 'profile_card_male.png';
        
      // 🆕 استخدام path.join لإنشاء مسار مطلق وموثوق للقالب
      const templatePath = path.join(BASE_DIR, 'assets', 'images', templateFileName);


      console.log(`🎨 محاولة إنشاء بطاقة ${gender} للاعب ${player.name}. مسار القالب: ${templatePath}`);
      
      // التحقق النهائي من وجود ملف القالب قبل محاولة التحميل
      if (!fs.existsSync(templatePath)) {
        throw new Error(`ملف القالب غير موجود في المسار: ${templatePath}`);
      }

      // تحميل صورة القالب
      const template = await loadImage(templatePath);
      
      // إنشاء canvas
      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      // رسم القالب
      ctx.drawImage(template, 0, 0);

      // إعداد الخطوط
      ctx.textAlign = 'left';
      ctx.fillStyle = '#2c3e50';

      // استخدام الخط العربي المسجل (أو الافتراضي)
      const fontFamily = 'Arabic, Arial, sans-serif';

      // كتابة البيانات على البطاقة - (الإحداثيات تعتمد على تصميمك)
      this.drawText(ctx, player.name, 120, 80, '32px', fontFamily, '#e74c3c');
      this.drawText(ctx, `LEVEL: ${player.level || 1}`, 120, 130, '24px', fontFamily);
      this.drawText(ctx, `HP: ${player.health || player.maxHealth}/${player.maxHealth || 100}`, 120, 180, '20px', fontFamily);
      // استخدام دوال الآمان إذا لم يكن موجوداً
      this.drawText(ctx, `ATK: ${player.getAttackDamage ? player.getAttackDamage() : 'N/A'}`, 120, 220, '20px', fontFamily); 
      this.drawText(ctx, `DEF: ${player.getDefense ? player.getDefense() : 'N/A'}`, 120, 260, '20px', fontFamily);
      this.drawText(ctx, `STA: ${player.stats?.battlesWon || 0}`, 120, 300, '20px', fontFamily);
      this.drawText(ctx, `MP: ${player.mana || player.maxMana}/${player.maxMana || 50}`, 120, 340, '20px', fontFamily);
      
      const tier = this.calculateTier(player);
      this.drawText(ctx, `TIER: ${tier}`, 120, 380, '20px', fontFamily, this.getTierColor(tier));

      // حفظ الصورة
      const buffer = canvas.toBuffer('image/png');
      const fileName = `profile_${player.userId}_${Date.now()}.png`;
      const tempDir = path.join(BASE_DIR, 'temp'); 
      filePath = path.join(tempDir, fileName);

      // التأكد من وجود مجلد temp
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log(`✅ تم إنشاء مجلد temp.`);
      }

      fs.writeFileSync(filePath, buffer);
      console.log(`✅ تم إنشاء البطاقة: ${filePath}`);
      return filePath;

    } catch (error) {
      // ❗ إلقاء خطأ حاد برسالة واضحة للمساعدة في تتبع المشكلة
      console.error('❌ خطأ في generateCard (تتبع الأخطاء):', error.message);
      throw new Error(`فشل حاسم في إنشاء البطاقة. (السبب: ${error.message}). يرجى التحقق من مجلد assets/images/`);
    }
  }

  drawText(ctx, text, x, y, fontSize, fontFamily, color = '#2c3e50') {
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  getTierColor(tier) {
    const colors = {
      'SS': '#ff0000', 
      'S': '#ff6b00', 
      'A': '#f39c12', 
      'B': '#9b59b6', 
      'C': '#3498db', 
      'D': '#2ecc71', 
      'E': '#95a5a6'  
    };
    return colors[tier] || '#2c3e50';
  }

  // تنظيف الملفات المؤقتة القديمة
  cleanupOldFiles(maxAge = 3600000) { 
    try {
      const tempDir = path.join(BASE_DIR, 'temp'); // استخدام المسار المطلق
      if (!fs.existsSync(tempDir)) return;

      const files = fs.readdirSync(tempDir);
      const now = Date.now();

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🧹 تم حذف الملف المؤقت: ${file}`);
        }
      });
    } catch (error) {
      console.error('❌ خطأ في تنظيف الملفات المؤقتة:', error);
    }
  }
                                     }
