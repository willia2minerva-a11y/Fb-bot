// utils/ProfileCardGenerator.js

import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProfileCardGenerator {
    constructor() {
        this.fontFamily = 'Arial'; // خط افتراضي
        
        try {
            // مسار الخط بناءً على هيكل ملفاتك: assets/Cinzel-VariableFont_wght.ttf
            const fontPath = path.join(process.cwd(), 'assets', 'Cinzel-VariableFont_wght.ttf');
            
            if (fs.existsSync && fs.existsSync(fontPath)) {
                registerFont(fontPath, { family: 'Cinzel' });
                this.fontFamily = 'Cinzel';
                console.log('✅ تم تسجيل خط Cinzel بنجاح.');
            } else {
                console.warn('⚠️ خط Cinzel غير موجود في المسار assets/. استخدام الخط الافتراضي (Arial).');
            }
        } catch (error) {
            console.error('❌ خطأ أثناء تسجيل الخط:', error.message);
        }
    }

    async generateCard(player) {
        // الأبعاد الثابتة للبطاقة الأصلية (تم تخمينها لتناسب القالب)
        const width = 600; 
        const height = 375; 

        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        // 1. تحديد الخلفية بناءً على الجنس
        let cardImagePath;
        
        // مسارات الصور بناءً على هيكل ملفاتك: assets/images/...
        if (player.gender && player.gender.toLowerCase() === 'female') {
            cardImagePath = path.join(process.cwd(), 'assets', 'images', 'profile_card_female.png');
        } else {
            // يشمل الذكر وأي جنس غير محدد
            cardImagePath = path.join(process.cwd(), 'assets', 'images', 'profile_card_male.png');
        }

        try {
            // تحميل صورة البطاقة كخلفية
            const cardImage = await loadImage(cardImagePath);
            context.drawImage(cardImage, 0, 0, width, height);

        } catch (error) {
            // خلفية طوارئ في حال فشل تحميل الصورة الأصلية (لحل مشكلة البطاقة السوداء)
            console.error(`❌ فشل تحميل صورة البطاقة (${player.gender}):`, error.message);
            context.fillStyle = '#1A1A1A'; // لون أسود داكن
            context.fillRect(0, 0, width, height);
        }

        // 2. تجميع البيانات وتحديد الإحداثيات
        
        const data = {
            name: player.name || "مقاتل مجهول",
            level: player.level || 1,
            health: player.health || 100,
            mana: player.mana || 50,
            attack: player.getAttackDamage ? player.getAttackDamage() : 10,
            defense: player.getDefense ? player.getDefense() : 5,
            tier: (player.tier || 'E').toUpperCase(),
        };

        const TEXT_COLOR = '#FFD700'; // اللون الذهبي
        const STATS_COLOR = '#FFFFFF';
        
        // إحداثيات تعتمد على تصميم القالب الأصلي (يجب أن تتناسب مع خط Cinzel وحجم النص)
        const STATS_LEFT_COL_X = width - 290; // موضع بدء العمود الأيمن في القالب
        const STATS_RIGHT_COL_X = width - 150; // موضع بدء العمود الأيسر في القالب

        // 3. رسم النصوص على البطاقة

        context.shadowColor = 'rgba(0,0,0,0.7)';
        context.shadowBlur = 4;
        context.textAlign = 'left';
        
        // الاسم
        context.fillStyle = TEXT_COLOR;
        context.font = `bold 22px "${this.fontFamily}"`;
        // إحداثي Y يهدف إلى الكتابة بعد كلمة "Name:" في القالب
        context.fillText(data.name, STATS_LEFT_COL_X + 10, 68); 
        
        // المستوى
        context.font = `20px "${this.fontFamily}"`;
        // إحداثي Y يهدف إلى الكتابة بعد كلمة "LEVEL:" في القالب
        context.fillText(data.level.toString(), STATS_LEFT_COL_X + 10, 118);

        // --- الإحصائيات (العمود الأيمن في القالب) ---
        context.fillStyle = STATS_COLOR;
        context.font = `20px "${this.fontFamily}"`;
        
        // الصحة (HP)
        context.fillText(data.health.toString(), STATS_LEFT_COL_X + 10, 195);

        // الدفاع (DEF)
        context.fillText(data.defense.toString(), STATS_LEFT_COL_X + 10, 240);

        // المانا (MP)
        context.fillText(data.mana.toString(), STATS_LEFT_COL_X + 10, 285);

        // --- الإحصائيات (العمود الأيسر في القالب) ---
        
        // الهجوم (ATK)
        context.fillText(data.attack.toString(), STATS_RIGHT_COL_X + 10, 195);
        
        // التير (TIER)
        context.fillText(data.tier, STATS_RIGHT_COL_X + 10, 285);
        
        
        // 4. حفظ الصورة
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        const outputPath = path.join(tempDir, `${player.userId}_profile_${Date.now()}.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        
        console.log(`✅ تم إنشاء بطاقة بروفايل للاعب ${data.name} (جنس: ${player.gender})`);

        return outputPath;
    }

    // دالة تنظيف الملفات القديمة (غير معدلة)
    async cleanupOldFiles() {
        try {
            const tempDir = path.join(process.cwd(), 'temp');
            const files = await fs.readdir(tempDir);
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;

            for (const file of files) {
                if (file.endsWith('.png')) {
                    const filePath = path.join(tempDir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (now - stats.mtime.getTime() > oneHour) {
                        await fs.unlink(filePath);
                        console.log(`🧹 تم حذف الملف القديم: ${file}`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ خطأ في تنظيف الملفات:', error);
        }
    }
}
