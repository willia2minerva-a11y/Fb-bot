import canvas from 'canvas';
import fs from 'fs';
import path from 'path';

const { createCanvas, loadImage, registerFont } = canvas;

// تحديد المسار الأساسي للمشروع لضمان العثور على مجلد assets
const BASE_DIR = path.resolve();

export class ProfileCardGenerator {
  constructor() {
    // تسجيل خط Cinzel الذي تم رفعه
    try {
      // 🆕 تم تحديث المسار واسم الخط إلى Cinzel بناءً على طلبك
      const fontPath = path.join(BASE_DIR, 'assets', 'Cinzel-VariableFont_wght.ttf');
      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'Cinzel' });
        console.log('✅ تم تسجيل الخط "Cinzel" بنجاح.');
      } else {
        console.log('⚠️ لم يتم العثور على ملف الخط Cinzel في المسار المحدد. سيتم استخدام خط افتراضي.');
      }
    } catch (error) {
      console.log('⚠️ خطأ في تسجيل الخط:', error.message);
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
    // هنا يمكن استخدام منطق للأسماء اللاتينية أو الافتراض على male
    return 'male'; 
  }

  async generateCard(player) {
    let filePath = null;
    
    try {
      const gender = this.determineGender(player.name);
      const templateFileName = gender === 'female' 
        ? 'profile_card_female.png'
        : 'profile_card_male.png';
        
      const templatePath = path.join(BASE_DIR, 'assets', 'images', templateFileName);

      console.log(`🎨 محاولة إنشاء بطاقة ${gender} للاعب ${player.name}. مسار القالب: ${templatePath}`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`ملف القالب غير موجود في المسار: ${templatePath}`);
      }

      const template = await loadImage(templatePath);
      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(template, 0, 0);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#2c3e50';
      
      // استخدام خط Cinzel
      const fontFamily = 'Cinzel, Arial, sans-serif';

      this.drawText(ctx, player.name, 120, 80, '32px', fontFamily, '#e74c3c');
      this.drawText(ctx, `LEVEL: ${player.level || 1}`, 120, 130, '24px', fontFamily);
      this.drawText(ctx, `HP: ${player.health || player.maxHealth}/${player.maxHealth || 100}`, 120, 180, '20px', fontFamily);
      this.drawText(ctx, `ATK: ${player.getAttackDamage ? player.getAttackDamage() : 'N/A'}`, 120, 220, '20px', fontFamily);
      this.drawText(ctx, `DEF: ${player.getDefense ? player.getDefense() : 'N/A'}`, 120, 260, '20px', fontFamily);
      this.drawText(ctx, `STA: ${player.stats?.battlesWon || 0}`, 120, 300, '20px', fontFamily);
      this.drawText(ctx, `MP: ${player.mana || player.maxMana}/${player.maxMana || 50}`, 120, 340, '20px', fontFamily);
      
      const tier = this.calculateTier(player);
      this.drawText(ctx, `TIER: ${tier}`, 120, 380, '20px', fontFamily, this.getTierColor(tier));

      const buffer = canvas.toBuffer('image/png');
      const fileName = `profile_${player.userId}_${Date.now()}.png`;
      const tempDir = path.join(BASE_DIR, 'temp'); 
      filePath = path.join(tempDir, fileName);

      // التأكد من وجود مجلد temp وإمكانية الكتابة فيه
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log(`✅ تم إنشاء مجلد temp.`);
      }

      fs.writeFileSync(filePath, buffer);
      console.log(`✅ تم إنشاء البطاقة: ${filePath}`);
      return filePath;

    } catch (error) {
      console.error('❌ خطأ في generateCard (تتبع الأخطاء):', error.message);
      throw new Error(`فشل حاسم في إنشاء البطاقة. (السبب: ${error.message}). يرجى التحقق من مسارات القوالب.`);
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

  // 🆕 تم تحسين دالة التنظيف
  cleanupOldFiles(maxAge = 3600000) { 
    try {
      const tempDir = path.join(BASE_DIR, 'temp'); 
      if (!fs.existsSync(tempDir)) return;

      const files = fs.readdirSync(tempDir);
      const now = Date.now();

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        // التحقق من أن الملف صورة مؤقتة وقديم بما فيه الكفاية
        if (file.startsWith('profile_') && now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🧹 تم حذف الملف المؤقت القديم: ${file}`);
        }
      });
    } catch (error) {
      // لا ترمي خطأ لكي لا يتوقف البوت بالكامل
      console.error('❌ خطأ في تنظيف الملفات المؤقتة:', error);
    }
  }
    }
