import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs/promises';
import path from 'path';

export class ProfileCardGenerator {
    constructor() {
        // 1. تسجيل الخط
        try {
            // المسار: assets/Cinzel-VariableFont_wght.ttf
            registerFont(path.join(process.cwd(), 'assets', 'Cinzel-VariableFont_wght.ttf'), { family: 'Cinzel' });
            console.log('✅ تم تسجيل خط Cinzel بنجاح.');
        } catch (error) {
            console.error('❌ فشل تسجيل خط Cinzel:', error);
            // قد تحتاج إلى خط احتياطي هنا إذا لم يتم العثور على الخط
        }
    }

    /**
     * ينشئ بطاقة بروفايل اللاعب كصورة
     * @param {Object} player - كائن اللاعب الذي يحتوي على البيانات (name, level, health, gold, gender, etc.)
     * @returns {Promise<string>} مسار ملف الصورة الناتج
     */
    async generateCard(player) {
        const width = 800;
        const height = 400;

        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        try {
            // 2. تحديد مسار الخلفية بناءً على جنس اللاعب
            let backgroundFileName;
            // نفترض أن كائن اللاعب (player) يحتوي على خاصية 'gender'
            if (player.gender && player.gender.toLowerCase() === 'female') {
                backgroundFileName = 'profile_card_female.png';
            } else {
                backgroundFileName = 'profile_card_male.png';
            }
            
            const backgroundPath = path.join(process.cwd(), 'assets', 'images', backgroundFileName);
            
            // 3. تحميل ورسم صورة الخلفية
            const background = await loadImage(backgroundPath);
            context.drawImage(background, 0, 0, width, height);
            
            // إضافة ظل للنص لجعل القراءة أسهل
            context.shadowColor = 'rgba(0,0,0,0.6)';
            context.shadowBlur = 8;
            context.fillStyle = '#FFFFFF'; // لون النص أبيض

            // 4. رسم اسم اللاعب (في الأعلى والمنتصف)
            context.font = 'bold 50px Cinzel, sans-serif';
            context.textAlign = 'center';
            context.fillText(player.name || "مقاتل مجهول", width / 2, 70);

            // 5. رسم المستوى والحالة الأساسية
            context.font = '30px Cinzel, sans-serif';
            context.fillText(`المستوى: ${player.level || 1}`, width / 2, 120);
            
            context.shadowBlur = 4; // ظل أقل للإحصائيات
            context.font = '24px Cinzel, sans-serif';
            
            // حسابات الخبرة
            const expProgress = player.experience || 0;
            const requiredExp = player.level * 100;
            const expPercentage = Math.floor((expProgress / requiredExp) * 100) || 0;
            
            // الإحصائيات في العمود الأيمن
            context.textAlign = 'left';
            context.fillText(`❤️ الصحة: ${player.health}/${player.maxHealth}`, 50, 200);
            context.fillText(`💰 الذهب: ${player.gold || 0}`, 50, 250);
            context.fillText(`⚔️ الهجوم: ${player.getAttackDamage ? player.getAttackDamage() : 10}`, 50, 300);
            
            // الإحصائيات في العمود الأيسر
            context.textAlign = 'right';
            context.fillText(`⭐ الخبرة: ${expProgress} (${expPercentage}%)`, width - 50, 200);
            context.fillText(`🗺️ الموقع: ${player.currentLocation || 'القرية'}`, width - 50, 250);
            context.fillText(`🛡️ الدفاع: ${player.level * 2}`, width - 50, 300);

            // 6. حفظ الصورة
            // إنشاء مجلد temp إذا لم يكن موجوداً
            const tempDir = path.join(process.cwd(), 'temp');
            await fs.mkdir(tempDir, { recursive: true });
            
            const outputPath = path.join(tempDir, `${player.userId}_profile.png`);
            const buffer = canvas.toBuffer('image/png');
            await fs.writeFile(outputPath, buffer);
            
            console.log(`✅ تم إنشاء بطاقة بروفايل للاعب ${player.name} في: ${outputPath}`);

            return outputPath;
        } catch (error) {
            console.error('❌ خطأ تفصيلي في generateCard:');
            console.error('📝 رسالة الخطأ:', error.message);
            console.error('📂 مكدس الاستدعاء:', error.stack);
            throw new Error('فشل في إنشاء بطاقة البروفايل، تحقق من مسارات الخط والصور.');
        }
    }
                                    }
