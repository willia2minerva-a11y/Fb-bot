// utils/ProfileCardGenerator.js

import { createCanvas, loadImage, registerFont } from 'canvas';
import { items as itemsData } from '../data/items.js'; 
import fs from 'fs';
import path from 'path';

// 💡 التأكد من تسجيل الخطوط بشكل صحيح.
try {
    const fontPath = path.resolve('assets/fonts/Cinzel-VariableFont_wght.ttf');  
    if (fs.existsSync(fontPath)) {  
        registerFont(fontPath, { family: 'Cinzel' });  
    } else {  
        console.warn('⚠️ خط Cinzel غير موجود في المسار. استخدام الخط الافتراضي (Arial).');  
    }
} catch (error) {
    console.error('❌ خطأ في تسجيل الخط:', error);
}

export class ProfileCardGenerator {

    constructor() {  
        // حجم البطاقة (مناسب للصور المرفقة)
        this.WIDTH = 800;  
        this.HEIGHT = 480; 
        this.FONT_FAMILY = 'Cinzel, Arial, sans-serif';   
        this.OUTPUT_DIR = path.resolve('assets/profiles');  
        // 🆕 تم تعديل المسار هنا ليكون أكثر مرونة
        this.BACKGROUNDS_DIR = path.resolve('assets/images'); 

        if (!fs.existsSync(this.OUTPUT_DIR)) {  
            fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });  
        }  
    }  

    _calculateRank(level) {  
        if (level >= 90) return 'SS';  
        if (level >= 75) return 'S';  
        if (level >= 60) return 'A';  
        if (level >= 45) return 'B';  
        if (level >= 30) return 'C';  
        return 'E';  
    }  

    async generateCard(player) {  
        const canvas = createCanvas(this.WIDTH, this.HEIGHT);  
        const ctx = canvas.getContext('2d');  
        const width = this.WIDTH;  
        const height = this.HEIGHT;  

        try {  
            // 1. تحديد وتحميل الخلفية بناءً على جنس اللاعب
            const gender = player.gender || 'male'; 
            const backgroundFileName = `profile_card_${gender}.png`;
            const backgroundPath = path.join(this.BACKGROUNDS_DIR, backgroundFileName);
            
            let backgroundImage;
            if (fs.existsSync(backgroundPath)) {
                backgroundImage = await loadImage(backgroundPath);
                ctx.drawImage(backgroundImage, 0, 0, width, height);
            } else {
                // خلفية احتياطية
                const gradient = ctx.createLinearGradient(0, 0, width, height);  
                gradient.addColorStop(0, '#2d3748');  
                gradient.addColorStop(1, '#4a5568');  
                ctx.fillStyle = gradient;  
                ctx.fillRect(0, 0, width, height); 
            }

            // 2. حساب الإحصائيات 
            const level = player.level || 1;  
            const health = player.health || 0;  
            const maxHealth = player.maxHealth || 100;  
            const mana = player.mana || 0;  
            const maxMana = player.maxMana || 50;  
            const rank = this._calculateRank(level);  
            
            const attackDamage = player.getAttackDamage ? player.getAttackDamage(itemsData) : 10;   
            const defense = player.getDefense ? player.getDefense(itemsData) : 5;  
            
            const stamina = player.getActualStamina ? player.getActualStamina() : (player.stamina || 100);  
            const maxStamina = player.maxStamina || 100;  

            // 🆕 إعدادات النص (الألوان والأحجام)
            // استخدام الأبيض لضمان الوضوح وتقليل الظل الأسود
            ctx.shadowColor = 'rgba(0,0,0,0.5)';  
            ctx.shadowBlur = 4; // ظل خفيف
            ctx.fillStyle = '#FFFFFF'; // لون النص الرئيسي: أبيض ساطع
            ctx.strokeStyle = '#000000'; // خط خارجي أسود خفيف
            ctx.lineWidth = 0.5;


            // =====================================  
            // 3. كتابة البيانات على أماكنها في الصورة 
            // =====================================  
            
            // 3.1 الاسم والمستوى (أكبر خط)
            
            // الاسم
            ctx.textAlign = 'left';  
            ctx.font = `bold 40px "${this.FONT_FAMILY}"`;  
            ctx.fillText(player.name || "مقاتل مجهول", 350, 80); // موقع الاسم 
            
            // المستوى
            ctx.font = `bold 40px "${this.FONT_FAMILY}"`;  
            ctx.fillText(`${level}`, 480, 160); // موقع المستوى 


            // 3.2 إحصائيات القوة والخصائص (خط أصغر)
            
            ctx.shadowBlur = 3;
            ctx.fillStyle = '#FFFFFF'; // أبيض
            ctx.font = `25px "${this.FONT_FAMILY}"`; // حجم خط أصغر للإحصائيات 
            ctx.textAlign = 'left';

            // الإحداثيات تم تعديلها لتتناسب مع أبعاد الأيقونات في الصورة
            
            // HP: (الصحة) - العمود الأول
            ctx.fillText(`${health}/${maxHealth}`, 365, 275); 

            // DEF: (الدفاع)
            ctx.fillText(`${defense}`, 365, 335);
            
            // MP: (المانا)
            ctx.fillText(`${mana}/${maxMana}`, 365, 395);

            
            // ATK: (الهجوم) - العمود الثاني
            ctx.fillText(`${attackDamage}`, 575, 275);

            // STA: (النشاط)
            ctx.fillText(`${Math.floor(stamina)}/${maxStamina}`, 575, 335); 

            // TIER: (الرتبة)
            ctx.font = `bold 28px "${this.FONT_FAMILY}"`;
            ctx.fillStyle = '#FFD700'; // لون ذهبي للرتبة
            ctx.fillText(`${rank}`, 575, 395);
            
            
            // 4. حفظ الصورة 
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
        // دالة لم تعد مستخدمة.
    }  

    async cleanupOldFiles() {  
        try {  
            const files = fs.readdirSync(this.OUTPUT_DIR);  
            const now = Date.now();  
            const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة  
              
            for (const file of files) {  
                if (file.endsWith('.png')) {  
                    const filePath = path.join(this.OUTPUT_DIR, file);  
                    const stats = fs.statSync(filePath);  
                      
                    if (now - stats.mtimeMs > maxAge) {  
                        fs.unlinkSync(filePath);  
                        console.log(`🧹 تم حذف الملف القديم: ${file}`);  
                    }  
                }  
            }  
        } catch (error) {  
            console.error('❌ خطأ في تنظيف الملفات:', error);  
        }  
    }  
            }
