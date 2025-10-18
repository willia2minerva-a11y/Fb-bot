// utils/ProfileCardGenerator.js
import { createCanvas, loadImage, registerFont } from 'canvas';
import { items as itemsData } from '../data/items.js';
import fs from 'fs';
import path from 'path';

export class ProfileCardGenerator {

    constructor() {
        this.WIDTH = 800;
        this.HEIGHT = 480;
        this.FONT_FAMILY = 'RPGFont'; // اسم عائلة الخط
        this.OUTPUT_DIR = path.resolve('assets/profiles');
        this.BACKGROUNDS_DIR = path.resolve('assets/images');

        // 🔸 تأكد أن مجلد الملفات موجود
        if (!fs.existsSync(this.OUTPUT_DIR)) {
            fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
        }

        // ✅ تسجيل الخط بشكل مضمون
        const fontCandidates = [
            path.resolve('assets/fonts/CarterOne-Regular.ttf'),
            path.resolve('assets/fonts/Cinzel-Bold.ttf'),
            path.resolve('assets/fonts/NotoSans-Bold.ttf'),
        ];

        let fontLoaded = false;
        for (const fontPath of fontCandidates) {
            if (fs.existsSync(fontPath)) {
                try {
                    registerFont(fontPath, { family: this.FONT_FAMILY });
                    console.log(`✅ تم تحميل الخط: ${fontPath}`);
                    fontLoaded = true;
                    break;
                } catch (e) {
                    console.error(`⚠️ فشل تحميل الخط: ${fontPath}`, e);
                }
            }
        }

        if (!fontLoaded) {
            console.warn('⚠️ لم يتم العثور على أي خط مخصص. سيتم استخدام Arial.');
            registerFont(path.resolve('C:/Windows/Fonts/arial.ttf'), { family: this.FONT_FAMILY });
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

        try {
            // 🔹 تحديد الخلفية حسب الجنس
            const gender = player.gender || 'male';
            const bgFile = `profile_card_${gender}.png`;
            const bgPath = path.join(this.BACKGROUNDS_DIR, bgFile);

            if (fs.existsSync(bgPath)) {
                const bg = await loadImage(bgPath);
                ctx.drawImage(bg, 0, 0, this.WIDTH, this.HEIGHT);
            } else {
                ctx.fillStyle = '#4b3826';
                ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
            }

            // 🔹 البيانات
            const level = player.level || 1;
            const rank = this._calculateRank(level);
            const attack = player.getAttackDamage ? player.getAttackDamage(itemsData) : 10;
            const defense = player.getDefense ? player.getDefense(itemsData) : 5;
            const health = player.health || 0;
            const maxHealth = player.maxHealth || 100;
            const mana = player.mana || 0;
            const maxMana = player.maxMana || 50;
            const stamina = player.getActualStamina ? player.getActualStamina() : player.stamina || 100;
            const maxStamina = player.maxStamina || 100;

            // 🌟 إعداد الظلال والخط
            ctx.textAlign = 'left';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 3;

            // ✨ الاسم (ذهبي)
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold 46px "${this.FONT_FAMILY}"`;
            ctx.fillText(player.name || 'Unknown', 370, 90);

            // ✨ المستوى (أبيض)
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 38px "${this.FONT_FAMILY}"`;
            ctx.fillText(level.toString(), 480, 155);

            // ✨ الإحصائيات
            ctx.font = `bold 30px "${this.FONT_FAMILY}"`;
            ctx.fillStyle = '#FFFFFF';

            // العمود الأيسر
            ctx.fillText(`${health}/${maxHealth}`, 365, 265); // HP
            ctx.fillText(`${defense}`, 365, 330);             // DEF
            ctx.fillText(`${mana}/${maxMana}`, 365, 395);     // MP

            // العمود الأيمن
            ctx.fillText(`${attack}`, 580, 265);              // ATK
            ctx.fillText(`${Math.floor(stamina)}/${maxStamina}`, 580, 330); // STA

            // ✨ الرتبة (ذهبي)
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold 32px "${this.FONT_FAMILY}"`;
            ctx.fillText(rank, 580, 395);

            // 💾 حفظ الصورة
            const filename = `${player.userId}_profile_${Date.now()}.png`;
            const outputPath = path.join(this.OUTPUT_DIR, filename);

            return await new Promise((resolve, reject) => {
                const out = fs.createWriteStream(outputPath);
                const stream = canvas.createPNGStream();
                stream.pipe(out);
                out.on('finish', () => resolve(outputPath));
                out.on('error', reject);
            });

        } catch (error) {
            console.error('❌ خطأ أثناء إنشاء البطاقة:', error);
            throw new Error('فشل إنشاء بطاقة البروفايل');
        }
    }

    async cleanupOldFiles() {
        try {
            const files = fs.readdirSync(this.OUTPUT_DIR);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000;

            for (const file of files) {
                if (file.endsWith('.png')) {
                    const filePath = path.join(this.OUTPUT_DIR, file);
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtimeMs > maxAge) {
                        fs.unlinkSync(filePath);
                        console.log(`🧹 تم حذف: ${file}`);
                    }
                }
            }
        } catch (e) {
            console.error('❌ خطأ في تنظيف الملفات:', e);
        }
    }
            }
