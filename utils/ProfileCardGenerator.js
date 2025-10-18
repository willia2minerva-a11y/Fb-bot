// utils/ProfileCardGenerator.js

import { createCanvas, loadImage, registerFont } from 'canvas';
import { items as itemsData } from '../data/items.js'; 
import fs from 'fs';
import path from 'path';

// 💡 التأكد من تسجيل الخطوط بشكل صحيح.
try {
    // يجب أن يتطابق هذا المسار مع موقع ملف الخط لديك.
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
                // خلفية احتياطية في حال فشل تحميل الصورة
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
            
            // 💡 تمرير itemsData
            const attackDamage = player.getAttackDamage ? player.getAttackDamage(itemsData) : 10;   
            const defense = player.getDefense ? player.getDefense(itemsData) : 5;  
            
            const stamina = player.getActualStamina ? player.getActualStamina() : (player.stamina || 100);  
            const maxStamina = player.maxStamina || 100;  

            // 🆕 إعدادات النص المحسنة
            ctx.shadowColor = 'rgba(0,0,0,0.7)';  
            ctx.shadowBlur = 8; 
            ctx.fillStyle = '#FFD700'; // لون ذهبي ساطع
            ctx.strokeStyle = 'rgba(0,0,0,0.5)'; 
            ctx.lineWidth = 1;


            // =====================================  
            // 3. كتابة البيانات على أماكنها في الصورة 
            // =====================================  
            
            // 3.1 الاسم والمستوى
            
            // الاسم
            ctx.textAlign = 'left';  
            ctx.font = `bold 40px "${this.FONT_FAMILY}"`;  
            ctx.fillText(player.name || "مقاتل مجهول", 350, 85);  
            
            // المستوى
            ctx.font = `35px "${this.FONT_FAMILY}"`;  
            ctx.fillText(`${level}`, 480, 165); 

            
            // 3.2 إحصائيات القوة والخصائص (مواقع محسنة)
            
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#FFD700'; 
            ctx.font = `30px "${this.FONT_FAMILY}"`;  
            ctx.textAlign = 'left';

            // HP: (الصحة)
            ctx.fillText(`${health}/${maxHealth}`, 380, 275);

            // DEF: (الدفاع)
            ctx.fillText(`${defense}`, 380, 340); // تم تعديل الموقع ليتناسب مع الصف الثالث
            
            // MP: (المانا)
            ctx.fillText(`${mana}/${maxMana}`, 380, 405); // تم تعديل الموقع ليتناسب مع الصف الرابع

            
            // ATK: (الهجوم)
            ctx.fillText(`${attackDamage}`, 580, 275);

            // STA: (النشاط)
            ctx.fillText(`${Math.floor(stamina)}/${maxStamina}`, 580, 340); // تم تعديل الموقع

            // TIER: (الرتبة)
            ctx.font = `30px "${this.FONT_FAMILY}"`;
            ctx.fillStyle = '#FFFFFF'; // لون أبيض للرانك لتمييزه
            ctx.shadowBlur = 0;
            ctx.fillText(`${rank}`, 580, 405); // تم تعديل الموقع
            
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
        // دالة لم تعد مستخدمة في هذا التصميم.
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
