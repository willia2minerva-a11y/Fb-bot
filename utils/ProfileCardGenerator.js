// utils/ProfileCardGenerator.js

import { createCanvas, loadImage, registerFont } from 'canvas';
import { items as itemsData } from '../data/items.js';
import fs from 'fs';
import path from 'path';

// 💡 تسجيل الخطوط
try {
    const fontPath = path.resolve('assets/fonts/Cinzel-Bold.ttf');
    if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'Cinzel' });
    } else {
        console.warn('⚠️ خط Cinzel غير موجود. استخدام Arial كبديل.');
    }
} catch (error) {
    console.error('❌ خطأ في تسجيل الخط:', error);
}

export class ProfileCardGenerator {

    constructor() {
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
            // 🔸 تحديد الخلفية حسب الجنس
            const gender = player.gender || 'male';
            const backgroundFileName = `profile_card_${gender}.png`;
            const backgroundPath = path.join(this.BACKGROUNDS_DIR, backgroundFileName);

            if (fs.existsSync(backgroundPath)) {
                const bg = await loadImage(backgroundPath);
                ctx.drawImage(bg, 0, 0, width, height);
            } else {
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, '#3b2f2f');
                gradient.addColorStop(1, '#5b4636');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            // 🧮 الحسابات
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

            // ✍️ إعداد النص - بدون ظل
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 🔸 الاسم (NAME) - أبيض كبير في الأعلى
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 42px "${this.FONT_FAMILY}"`;
            ctx.textAlign = 'left';
            ctx.fillText('Name:', 50, 80);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold 46px "${this.FONT_FAMILY}"`;
            ctx.fillText(player.name || 'Unknown', 180, 80);

            // 🔸 المستوى (LEVEL) - أبيض تحت الاسم
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 42px "${this.FONT_FAMILY}"`;
            ctx.fillText('Level:', 50, 150);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold 46px "${this.FONT_FAMILY}"`;
            ctx.fillText(level.toString(), 180, 150);

            // 🔹 الإحصائيات - أبيض وذهبي
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 36px "${this.FONT_FAMILY}"`;

            // الصف الأول: HP و ATK
            ctx.fillText('HP:', 50, 240);
            ctx.fillText('ATK:', 400, 240);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold 38px "${this.FONT_FAMILY}"`;
            ctx.fillText(`${health}/${maxHealth}`, 120, 240);     // HP value
            ctx.fillText(`${attack}`, 500, 240);                  // ATK value

            // الصف الثاني: DEF و STA
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 36px "${this.FONT_FAMILY}"`;
            ctx.fillText('DEF:', 50, 300);
            ctx.fillText('STA:', 400, 300);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold 38px "${this.FONT_FAMILY}"`;
            ctx.fillText(`${defense}`, 120, 300);                 // DEF value
            ctx.fillText(`${Math.floor(stamina)}/${maxStamina}`, 500, 300); // STA value

            // الصف الثالث: MP و TIER
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 36px "${this.FONT_FAMILY}"`;
            ctx.fillText('MP:', 50, 360);
            ctx.fillText('TIER:', 400, 360);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold 38px "${this.FONT_FAMILY}"`;
            ctx.fillText(`${mana}/${maxMana}`, 120, 360);         // MP value
            ctx.fillText(rank, 500, 360);                         // TIER value

            // 🖼️ حفظ الصورة النهائية
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
                        console.log(`🧹 تم حذف الملف القديم: ${file}`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ خطأ في تنظيف الملفات:', error);
        }
    }
}
