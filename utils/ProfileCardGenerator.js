import canvas from 'canvas';
import fs from 'fs';
import path from 'path';

const { createCanvas, loadImage, registerFont } = canvas;

export class ProfileCardGenerator {
  constructor() {
    // تسجيل الخطوط العربية (إذا كانت متوفرة)
    try {
      registerFont('./assets/fonts/arabic-font.ttf', { family: 'Arabic' });
    } catch (error) {
      console.log('⚠️  لم يتم العثور على خط عربي مخصص، سيتم استخدام الخط الافتراضي');
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
    // يمكن تحسين هذا المنطق بناءً على أسماء عربية
    const femaleIndicators = ['ة', 'اء', 'ى', 'آء', 'ه'];
    const lastChar = name.charAt(name.length - 1);
    
    if (femaleIndicators.includes(lastChar)) {
      return 'female';
    }
    return 'male';
  }

  async generateProfileCard(player) {
    try {
      const gender = this.determineGender(player.name);
      const templatePath = gender === 'female' 
        ? './assets/images/profile_card_female.png'
        : './assets/images/profile_card_male.png';

      console.log(`🎨 إنشاء بطاقة ${gender} للاعب ${player.name}`);

      // تحميل صورة القالب
      const template = await loadImage(templatePath);
      
      // إنشاء canvas
      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      // رسم القالب
      ctx.drawImage(template, 0, 0);

      // إعداد النص
      ctx.textAlign = 'left';
      ctx.fillStyle = '#2c3e50';

      // استخدام خط عربي إذا كان متوفراً، وإلا استخدام خط افتراضي
      const fontFamily = 'Arabic, Arial, sans-serif';

      // كتابة البيانات على البطاقة - يمكن تعديل الإحداثيات حسب التصميم
      this.drawText(ctx, player.name, 120, 80, '32px', fontFamily, '#e74c3c');
      this.drawText(ctx, `LEVEL: ${player.level}`, 120, 130, '24px', fontFamily);
      this.drawText(ctx, `HP: ${player.health}/${player.maxHealth}`, 120, 180, '20px', fontFamily);
      this.drawText(ctx, `ATK: ${player.getAttackDamage()}`, 120, 220, '20px', fontFamily);
      this.drawText(ctx, `DEF: ${player.getDefense()}`, 120, 260, '20px', fontFamily);
      this.drawText(ctx, `STA: ${player.stats?.battlesWon || 0}`, 120, 300, '20px', fontFamily);
      this.drawText(ctx, `MP: ${player.mana}/${player.maxMana}`, 120, 340, '20px', fontFamily);
      
      const tier = this.calculateTier(player);
      this.drawText(ctx, `TIER: ${tier}`, 120, 380, '20px', fontFamily, this.getTierColor(tier));

      // حفظ الصورة
      const buffer = canvas.toBuffer('image/png');
      const fileName = `profile_${player.userId}_${Date.now()}.png`;
      const filePath = path.join('./temp', fileName);

      // التأكد من وجود مجلد temp
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp', { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);
      console.log(`✅ تم إنشاء البطاقة: ${filePath}`);
      return filePath;

    } catch (error) {
      console.error('❌ خطأ في إنشاء بطاقة الملف الشخصي:', error);
      return null;
    }
  }

  drawText(ctx, text, x, y, fontSize, fontFamily, color = '#2c3e50') {
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  getTierColor(tier) {
    const colors = {
      'SS': '#ff0000', // أحمر
      'S': '#ff6b00',  // برتقالي
      'A': '#f39c12',  // أصفر ذهبي
      'B': '#9b59b6',  // بنفسجي
      'C': '#3498db',  // أزرق
      'D': '#2ecc71',  // أخضر
      'E': '#95a5a6'   // رمادي
    };
    return colors[tier] || '#2c3e50';
  }

  // تنظيف الملفات المؤقتة القديمة
  cleanupOldFiles(maxAge = 3600000) { // ساعة واحدة
    try {
      const tempDir = './temp';
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
