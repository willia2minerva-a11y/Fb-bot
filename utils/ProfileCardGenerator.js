import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProfileCardGenerator {
    constructor() {
        try {
            // المسار الصحيح للخطوط
            const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Cinzel-VariableFont_wght.ttf');
            registerFont(fontPath, { family: 'Cinzel' });
            console.log('✅ تم تسجيل خط Cinzel بنجاح.');
        } catch (error) {
            console.error('❌ فشل تسجيل خط Cinzel:', error.message);
        }
    }

    /**
     * ينشئ بطاقة بروفايل اللاعب كصورة
     */
    async generateCard(player) {
        const width = 800;
        const height = 400;

        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        try {
            // تحديد خلفية بناءً على الجنس
            let backgroundFileName = 'profile_card_male.png'; // افتراضي
            if (player.gender && player.gender.toLowerCase() === 'female') {
                backgroundFileName = 'profile_card_female.png';
            }
            
            const backgroundPath = path.join(process.cwd(), 'assets', 'images', backgroundFileName);
            
            // تحميل الخلفية
            const background = await loadImage(backgroundPath);
            context.drawImage(background, 0, 0, width, height);
            
            // إعدادات النص
            context.shadowColor = 'rgba(0,0,0,0.6)';
            context.shadowBlur = 8;
            context.fillStyle = '#FFFFFF';

            // اسم اللاعب
            context.font = 'bold 50px "Cinzel", sans-serif';
            context.textAlign = 'center';
            context.fillText(player.name || "مقاتل مجهول", width / 2, 70);

            // المستوى
            context.font = '30px "Cinzel", sans-serif';
            context.fillText(`المستوى: ${player.level || 1}`, width / 2, 120);
            
            // الإحصائيات مع ظل أقل
            context.shadowBlur = 4;
            context.font = '24px "Cinzel", sans-serif';
            
            // حسابات الخبرة
            const expProgress = player.experience || 0;
            const requiredExp = (player.level || 1) * 100;
            const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
            
            // العمود الأيمن
            context.textAlign = 'left';
            context.fillText(`❤️ الصحة: ${player.health}/${player.maxHealth}`, 50, 180);
            context.fillText(`💰 الذهب: ${player.gold || 0}`, 50, 220);
            context.fillText(`⚔️ الهجوم: ${player.getAttackDamage ? player.getAttackDamage() : 10}`, 50, 260);
            context.fillText(`🛡️ الدفاع: ${player.getDefense ? player.getDefense() : 5}`, 50, 300);
            
            // العمود الأيسر
            context.textAlign = 'right';
            context.fillText(`⭐ الخبرة: ${expProgress} (${expPercentage}%)`, width - 50, 180);
            context.fillText(`🗺️ الموقع: ${player.currentLocation || 'القرية'}`, width - 50, 220);
            context.fillText(`👦 الجنس: ${player.gender === 'male' ? 'ذكر' : 'أنثى'}`, width - 50, 260);
            context.fillText(`🆔 المعرف: ${player.playerId || 'غير معروف'}`, width - 50, 300);

            // حفظ الصورة
            const tempDir = path.join(process.cwd(), 'temp');
            await fs.mkdir(tempDir, { recursive: true });
            
            const outputPath = path.join(tempDir, `${player.userId}_profile_${Date.now()}.png`);
            const buffer = canvas.toBuffer('image/png');
            await fs.writeFile(outputPath, buffer);
            
            console.log(`✅ تم إنشاء بطاقة بروفايل للاعب ${player.name} في: ${outputPath}`);

            return outputPath;
        } catch (error) {
            console.error('❌ خطأ في generateCard:', error);
            throw new Error('فشل في إنشاء بطاقة البروفايل: ' + error.message);
        }
    }

    // تنظيف الملفات القديمة
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
