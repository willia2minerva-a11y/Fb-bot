// utils/ProfileCardGenerator.js

import { createCanvas, loadImage, registerFont } from 'canvas';
import { items as itemsData } from '../data/items.js'; 
import fs from 'fs';
import path from 'path';

// 💡 إصلاح مشكلة الخط: تسجيل الخط المطلوب (Cinzel)
try {
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
        // حجم البطاقة القياسي (محدث ليناسب أبعاد الصورة المرفقة)
        this.WIDTH = 800;  
        this.HEIGHT = 480; 
        this.FONT_FAMILY = 'Cinzel, Arial, sans-serif';   
        this.OUTPUT_DIR = path.resolve('assets/profiles');  
        // 🆕 مسار الخلفيات بناءً على لقطة الشاشة
        this.BACKGROUNDS_DIR = path.resolve('assets/images'); 

        if (!fs.existsSync(this.OUTPUT_DIR)) {  
            fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });  
        }  
    }  

    // 🆕 دالة مساعدة لحساب الرانك (بدون تغيير)
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
                // 🆕 رسم صورة الخلفية كطبقة أساسية
                ctx.drawImage(backgroundImage, 0, 0, width, height);
            } else {
                 // في حال عدم العثور على الصورة، نستخدم الخلفية الافتراضية
                console.warn(`⚠️ لم يتم العثور على صورة الخلفية: ${backgroundFileName}. باستخدام الخلفية الافتراضية.`);
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
            
            // 💡 الإصلاح: تمرير itemsData
            const attackDamage = player.getAttackDamage ? player.getAttackDamage(itemsData) : 10;   
            const defense = player.getDefense ? player.getDefense(itemsData) : 5;  
            
            const stamina = player.getActualStamina ? player.getActualStamina() : (player.stamina || 100);  
            const maxStamina = player.maxStamina || 100;  

            // إعدادات النص الأساسية للرسم فوق الخلفية
            ctx.shadowColor = 'rgba(0,0,0,0.8)';  
            ctx.shadowBlur = 5; 
            ctx.fillStyle = '#C8A461'; // لون ذهبي أغمق
            ctx.strokeStyle = '#000000'; 
            ctx.lineWidth = 1;


            // =====================================  
            // 3. كتابة البيانات على أماكنها في الصورة
            // =====================================  
            
            // 3.1 الاسم والمستوى (موقع تقديري بناءً على الصورة)
            ctx.textAlign = 'left';  
            
            // الاسم
            const nameX = 380;
            const nameY = 180;
            ctx.font = `bold 80px "${this.FONT_FAMILY}"`;  
            ctx.fillText(player.name || "مقاتل مجهول", nameX, nameY);  
            
            // المستوى
            const levelX = 450;
            const levelY = 220;
            ctx.font = `60px "${this.FONT_FAMILY}"`;  
            ctx.fillText(`${level}`, levelX, levelY);  

            // 3.2 إحصائيات القوة والرتبة (موقع تقديري)
            
            const statsCol1X = 450; // بداية العمود الأول للإحصائيات
            const statsCol2X = 580; // بداية العمود الثاني للإحصائيات
            const statsStartY = 270;
            const statsLineHeight = 55;

            // Health / MP / DEF
            ctx.font = `60px "${this.FONT_FAMILY}"`;  
            ctx.textAlign = 'left';

            // HP
            ctx.fillText(`${health}/${maxHealth}`, statsCol1X, statsStartY);

            // MP
            ctx.fillText(`${mana}/${maxMana}`, statsCol1X, statsStartY + statsLineHeight);
            
            // DEF
            ctx.fillText(`${defense}`, statsCol1X, statsStartY + (statsLineHeight * 2));

            // ATK / STA / TIER
            
            // ATK
            ctx.fillText(`${attackDamage}`, statsCol2X, statsStartY);

            // STA
            ctx.fillText(`${Math.floor(stamina)}/${maxStamina}`, statsCol2X, statsStartY + statsLineHeight);

            // TIER
            ctx.fillText(`${rank}`, statsCol2X, statsStartY + (statsLineHeight * 2));
            
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

    // تم حذف دالة _drawBar لأن الأشرطة لم تعد تستخدم في التصميم الجديد
    _drawBar(context, x, y, width, height, percent, color, label) {  
        // تم الاحتفاظ بالكود هنا فقط لتجنب كسر أي مكان آخر قد يستدعيها، ولكنها غير مستخدمة في generateCard
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
