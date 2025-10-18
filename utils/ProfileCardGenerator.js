// utils/ProfileCardGenerator.js (باستخدام مكتبة Sharp)

import sharp from 'sharp';
import { items as itemsData } from '../data/items.js'; 
import fs from 'fs';
import path from 'path';

export class ProfileCardGenerator {

    constructor() {  
        this.WIDTH = 800;  
        this.HEIGHT = 480; 
        // 💡 نستخدم خطوطاً شائعة لضمان التوافق على خادم Render
        this.FONT_FAMILY = 'Impact, Tahoma, Arial'; 
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

    // 🆕 دالة مساعدة لتوليد نص كملف SVG
    // تم ضبط الإحداثيات هنا لتناسب التصميم المرفق (البني الخشبي)
    _generateSvgTextLayer(text, size, x, y, color = '#FFFFFF', fontWeight = 'bold') {
        return Buffer.from(`
            <svg width="${this.WIDTH}" height="${this.HEIGHT}">
                <style>
                    .text { 
                        font-family: ${this.FONT_FAMILY}; 
                        font-size: ${size}px; 
                        fill: ${color}; 
                        font-weight: ${fontWeight}; 
                        /* لضبط موضع النص بدقة أكبر */
                        text-anchor: start; 
                        dominant-baseline: hanging; 
                        /* إضافة ظل خفيف لتحسين الوضوح على الخلفية الداكنة */
                        text-shadow: 1px 1px 3px #000000;
                    }
                </style>
                <text x="${x}" y="${y}" class="text">${text}</text>
            </svg>
        `);
    }

    async generateCard(player) {  
        const width = this.WIDTH;  
        const height = this.HEIGHT;  

        try {  
            // 1. تحديد الخلفية وتحميلها باستخدام Sharp
            const gender = player.gender || 'male'; 
            const backgroundFileName = `profile_card_${gender}.png`;
            const backgroundPath = path.join(this.BACKGROUNDS_DIR, backgroundFileName);
            
            // 🆕 استخدام Sharp لتحميل الخلفية
            let imageProcessor;
            if (fs.existsSync(backgroundPath)) {
                 imageProcessor = sharp(backgroundPath).resize(width, height);
            } else {
                 // إذا لم توجد الصورة، يتم إنشاء خلفية بنية احتياطية
                 imageProcessor = sharp({
                    create: {
                        width: width,
                        height: height,
                        channels: 3,
                        background: { r: 59, g: 47, b: 47, alpha: 1 } // لون بني داكن
                    }
                 }).png();
            }

            // 2. حساب الإحصائيات 
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
            
            
            // 3. دمج النصوص عبر SVG
            const layers = [];

            // 3.1 الاسم والمستوى (أكبر خط)
            
            // الاسم (ذهبي)
            layers.push({ 
                input: this._generateSvgTextLayer(player.name || 'مقاتل مجهول', 180, 410, 35, '#FFD700'), 
                left: 0, top: 0 
            });
            
            // المستوى (أبيض)
            layers.push({ 
                input: this._generateSvgTextLayer(level.toString(), 35, 500, 230, '#FFFFFF'), 
                left: 0, top: 0 
            });

            // 3.2 إحصائيات القوة والخصائص (مواقع محسنة)
            
            // HP: (الصحة) - أبيض
            layers.push({ input: this._generateSvgTextLayer(`${health}/${maxHealth}`, 20, 400, 300), left: 0, top: 0 }); 

            // DEF: (الدفاع) - أبيض
            layers.push({ input: this._generateSvgTextLayer(`${defense}`, 20, 410, 340), left: 0, top: 0 });
            
            // MP: (المانا) - أبيض
            layers.push({ input: this._generateSvgTextLayer(`${mana}/${maxMana}`, 20, 400, 410), left: 0, top: 0 });

            // ATK: (الهجوم) - أبيض
            layers.push({ input: this._generateSvgTextLayer(`${attack}`, 20, 610, 300), left: 0, top: 0 });

            // STA: (النشاط) - أبيض
            layers.push({ input: this._generateSvgTextLayer(`${Math.floor(stamina)}/${maxStamina}`, 20, 60, 340), left: 0, top: 0 }); 

            // TIER: (الرتبة) - ذهبي
            layers.push({ input: this._generateSvgTextLayer(rank, 20, 610, 410, '#FFD700'), left: 0, top: 0 });

            // 4. دمج الطبقات وإخراج الصورة
            const outputBuffer = await imageProcessor
                .composite(layers)
                .png()
                .toBuffer();
            
            // 5. حفظ الملف
            const filename = `${player.userId}_profile_${Date.now()}.png`;
            const outputPath = path.join(this.OUTPUT_DIR, filename);

            await fs.promises.writeFile(outputPath, outputBuffer);

            return outputPath;
            
        } catch (error) {  
            console.error('❌ خطأ في generateCard (Sharp):', error);  
            throw new Error('فشل في إنشاء بطاقة البروفايل (Sharp). تأكد من وجود ملفات الخلفية في المسار الصحيح وتثبيت مكتبة sharp. تفاصيل: ' + error.message);
        }  
    }  

    // ... (دالة التنظيف بدون تغيير)
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
