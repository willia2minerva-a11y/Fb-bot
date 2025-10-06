import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

// 💡 إصلاح مشكلة الخط: تسجيل الخط المطلوب (Cinzel)
try {
    const fontPath = path.resolve('assets/fonts/Cinzel.ttf');
    if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'Cinzel' });
    } else {
        console.warn('⚠️ خط Cinzel غير موجود في المسار assets/fonts/. استخدام الخط الافتراضي (Arial).');
    }
} catch (error) {
    console.error('❌ خطأ في تسجيل الخط:', error);
}


export class ProfileCardGenerator {
    constructor() {
        // حجم البطاقة القياسي
        this.WIDTH = 800;
        this.HEIGHT = 300;
        this.FONT_FAMILY = 'Cinzel, sans-serif'; // استخدام الخط المسجل أو الافتراضي
        this.OUTPUT_DIR = path.resolve('assets/profiles');

        if (!fs.existsSync(this.OUTPUT_DIR)) {
            fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
        }
    }

    async generateCard(player) {
        // إنشاء الكانفاس
        const canvas = createCanvas(this.WIDTH, this.HEIGHT);
        const ctx = canvas.getContext('2d');

        // 1. الخلفية (لون ثابت مؤقت)
        ctx.fillStyle = '#2c2f33'; // خلفية داكنة
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        // 2. حدود البطاقة
        ctx.strokeStyle = '#DAA520'; // ذهبي
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, this.WIDTH - 4, this.HEIGHT - 4);

        // 3. صورة البروفايل (افتراضية)
        // يجب استبدال هذا برابط أو ملف صورة اللاعب الحقيقي
        let profileImage;
        try {
            // يمكن استخدام صورة افتراضية للمستخدمين الجدد
            profileImage = await loadImage(path.resolve('assets/images/default_avatar.png'));
        } catch (e) {
            console.error('❌ فشل تحميل الصورة الافتراضية:', e.message);
            // رسم مربع فارغ في حالة الفشل
            ctx.fillStyle = '#555555';
            ctx.fillRect(50, 50, 200, 200);
            profileImage = null;
        }

        if (profileImage) {
            ctx.drawImage(profileImage, 50, 50, 200, 200);
        }

        // 4. كتابة البيانات (جهة اليمين)
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        let x = this.WIDTH - 40;
        let y = 70;

        // الاسم
        ctx.font = `30px "${this.FONT_FAMILY}"`;
        ctx.fillText(`الاسم: ${player.name}`, x, y);

        // المستوى
        y += 40;
        ctx.font = `24px "${this.FONT_FAMILY}"`;
        ctx.fillStyle = '#DAA520'; // ذهبي
        ctx.fillText(`المستوى: ${player.level}`, x, y);

        // الذهب
        y += 40;
        ctx.fillStyle = '#FFD700'; // أصفر
        ctx.fillText(`الذهب: ${player.gold}`, x, y);
        
        // الموقع
        y += 40;
        ctx.fillStyle = '#CCCCCC'; // رمادي
        ctx.fillText(`الموقع: ${player.currentLocation}`, x, y);

        // الصحة
        y += 40;
        ctx.fillStyle = '#dc3545'; // أحمر
        ctx.fillText(`الصحة: ${player.health}/${player.maxHealth}`, x, y);
        
        // 5. حفظ الصورة
        const filename = `${player.userId}_profile.png`;
        const outputPath = path.join(this.OUTPUT_DIR, filename);

        return new Promise((resolve, reject) => {
            const out = fs.createWriteStream(outputPath);
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            out.on('finish', () => resolve(outputPath));
            out.on('error', reject);
        });
    }
}
