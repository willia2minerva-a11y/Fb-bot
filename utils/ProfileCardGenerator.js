import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

// 💡 إصلاح مشكلة الخط: تسجيل الخط المطلوب (Cinzel)
try {
    // 🛠️ استخدام مسار نسبي آمن للخط المتغير (يجب أن يكون هذا المسار صحيحاً لديك)
    const fontPath = path.resolve('assets/fonts/Cinzel-VariableFont_wght.ttf');
    if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'Cinzel' });
    } else {
        console.warn('⚠️ خط Cinzel غير موجود. استخدام الخط الافتراضي (Arial).');
    }
} catch (error) {
    console.error('❌ خطأ في تسجيل الخط:', error);
}


export class ProfileCardGenerator {
    constructor() {
        // حجم البطاقة القياسي
        this.WIDTH = 800;
        this.HEIGHT = 400;
        this.FONT_FAMILY = 'Cinzel, Arial, sans-serif'; 
        this.OUTPUT_DIR = path.resolve('assets/profiles');

        if (!fs.existsSync(this.OUTPUT_DIR)) {
            fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
        }
    }

    // 🆕 دالة مساعدة لحساب الرانك
    _calculateRank(level) {
        if (level >= 90) return 'SS';
        if (level >= 75) return 'S';
        if (level >= 60) return 'A';
        if (level >= 45) return 'B';
        if (level >= 30) return 'C';
        if (level >= 15) return 'D';
        return 'E';
    }

    async generateCard(player) {
        const canvas = createCanvas(this.WIDTH, this.HEIGHT);
        const ctx = canvas.getContext('2d');
        const width = this.WIDTH;
        const height = this.HEIGHT;

        try {
            // 🛠️ استخراج وحساب الإحصائيات كقيم أولية
            const level = player.level || 1;
            const health = player.health || 0;
            const maxHealth = player.maxHealth || 100;
            const mana = player.mana || 0;
            const maxMana = player.maxMana || 50;
            const rank = this._calculateRank(level);
            const attackDamage = player.getAttackDamage ? player.getAttackDamage() : 10;
            const defense = player.getDefense ? player.getDefense() : 5;
            const stamina = player.getActualStamina ? player.getActualStamina() : (player.stamina || 100);
            const maxStamina = player.maxStamina || 100;

            // 1. الخلفية والإطار
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#2d3748');
            gradient.addColorStop(1, '#4a5568');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            ctx.strokeStyle = '#FFD700'; // 🛠️ إطار ذهبي
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, width - 20, height - 20);

            // إعدادات النص الأساسية
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#FFD700'; // 🛠️ لون الخط الذهبي

            // =====================================
            // 1. العنوان والرتبة
            // =====================================
            ctx.textAlign = 'center';
            ctx.font = `bold 50px "${this.FONT_FAMILY}"`;
            ctx.fillText(player.name || "مقاتل مجهول", width / 2, 70);

            ctx.font = `30px "${this.FONT_FAMILY}"`;
            ctx.fillText(`المستوى: ${level}`, width / 2, 120);

            // الرانك (Tier)
            ctx.textAlign = 'right';
            ctx.fillStyle = '#FFD700'; 
            ctx.font = `bold 40px "${this.FONT_FAMILY}"`;
            ctx.fillText(`[ RANK: ${rank} ]`, width - 30, 70);
            ctx.fillStyle = '#FFD700'; // إعادة اللون الذهبي


            // =====================================
            // 2. عرض الإحصائيات الرئيسية المطلوبة
            // =====================================
            ctx.shadowBlur = 4;
            ctx.font = `28px "${this.FONT_FAMILY}"`;
            
            const startX1 = 150;
            const startX2 = 450;
            let startY = 190;
            const lineHeight = 55;
            
            // العمود الأول (الصحة والمانا)
            ctx.textAlign = 'left';
            ctx.fillText(`❤️ الصحة: ${health}/${maxHealth}`, startX1, startY);
            startY += lineHeight;
            ctx.fillText(`⚡ المانا: ${mana}/${maxMana}`, startX1, startY);
            
            // العمود الثاني (الهجوم والدفاع)
            startY = 190;
            ctx.fillText(`⚔️ الهجوم: ${attackDamage}`, startX2, startY);
            startY += lineHeight;
            ctx.fillText(`🛡️ الدفاع: ${defense}`, startX2, startY);
            
            // =====================================
            // 3. شريط الصحة والمانا والتعب (أسفل)
            // =====================================
            const barY = height - 90;
            const barWidth = width - 100;
            const barHeight = 15;

            // شريط الصحة
            this._drawBar(ctx, 50, barY, barWidth, barHeight, health / maxHealth, '#E53E3E', 'الصحة');
            
            // شريط المانا
            this._drawBar(ctx, 50, barY + 20, barWidth, barHeight, mana / maxMana, '#4299E1', 'المانا');

            // 🆕 شريط النشاط
            this._drawBar(ctx, 50, barY + 40, barWidth, barHeight, stamina / maxStamina, '#38A169', 'النشاط');
            
            // حفظ الصورة
            const filename = `${player.userId}_profile_${Date.now()}.png`;
            const outputPath = path.join(this.OUTPUT_DIR, filename);

            return new Promise((resolve, reject) => {
                const out = fs.createWriteStream(outputPath);
                const stream = canvas.createPNGStream();
                stream.pipe(out);
                out.on('finish', () => resolve(outputPath));
                out.on('error', reject);
            });
            
        } catch (error) {
            console.error('❌ خطأ في generateCard:', error);
            throw new Error('فشل في إنشاء بطاقة البروفايل: ' + error.message);
        }
    }
    
    _drawBar(context, x, y, width, height, percent, color, label) {
        context.shadowBlur = 0;
        percent = Math.max(0, Math.min(1, percent)); 
        
        // الخلفية الرمادية
        context.fillStyle = '#555555';
        context.fillRect(x, y, width, height);
        
        // الشريط الملون
        context.fillStyle = color;
        context.fillRect(x, y, width * percent, height);
        
        // النص داخل الشريط (أبيض لضمان الوضوح)
        context.fillStyle = '#FFFFFF';
        context.font = `bold 12px "${this.FONT_FAMILY}"`;
        context.textAlign = 'center';
        context.fillText(label, x + 30, y + height / 2 + 4); 
    }

    async cleanupOldFiles() {
        // ... (منطق التنظيف يبقى كما هو)
    }
            }
