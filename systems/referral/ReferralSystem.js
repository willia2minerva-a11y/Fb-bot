// systems/referral/ReferralSystem.js
import Player from '../../core/Player.js';

export class ReferralSystem {
    constructor() {
        console.log('🎁 نظام الإحالة والمكافآت اليومية تم تهيئته');
    }

    // ✅ توليد كود دعوة فريد من معرف اللاعب
    _generateReferralCode(playerId) {
        // نأخذ آخر 5 أرقام ونضيف حروف عشوائية
        const numericPart = playerId.toString().slice(-5);
        const randomLetters = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `MG${numericPart}${randomLetters}`;
    }

    // ✅ الحصول على كود الإحالة أو إنشاؤه
    async getOrCreateReferralCode(player) {
        if (!player.referralCode) {
            // نتحقق من عدم التكرار
            let code;
            let exists = true;
            let attempts = 0;
            
            while (exists && attempts < 10) {
                code = this._generateReferralCode(player.playerId || player.userId);
                const existing = await Player.findOne({ referralCode: code });
                exists = !!existing;
                attempts++;
            }
            
            player.referralCode = code;
            await player.save();
        }
        
        return player.referralCode;
    }

    // ✅ استخدام كود دعوة
    async useReferralCode(player, code) {
        // التحقق من صحة الكود
        if (!code || code.trim().length === 0) {
            return { error: '❌ اكتب كود الدعوة.' };
        }

        const cleanedCode = code.trim().toUpperCase();

        // التحقق من عدم استخدام كود سابقاً
        if (player.referredBy) {
            return { error: '❌ لقد استخدمت كود دعوة مسبقاً!' };
        }

        // التحقق من أن اللاعب ليس صاحب الكود
        if (player.referralCode === cleanedCode) {
            return { error: '❌ لا يمكنك استخدام كودك الخاص!' };
        }

        // البحث عن صاحب الكود
        const referrer = await Player.findOne({ referralCode: cleanedCode });
        if (!referrer) {
            return { error: '❌ الكود غير صحيح أو غير موجود.' };
        }

        // منح المكافآت
        const referrerReward = 500; // ذهب للمدعو
        const newPlayerReward = 200;  // ذهب للمستخدم الجديد

        // مكافأة المدعو (صاحب الكود)
        referrer.addGold(referrerReward);
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        
        // تسجيل في قائمة المدعوين
        if (!referrer.referredPlayers) referrer.referredPlayers = [];
        referrer.referredPlayers.push({
            userId: player.userId,
            name: player.name,
            date: new Date()
        });

        // مكافأة المستخدم الجديد
        player.addGold(newPlayerReward);
        player.referredBy = referrer.userId;
        player.referredByName = referrer.name;

        await referrer.save();
        await player.save();

        return {
            success: true,
            message: `✅ تم تفعيل كود الدعوة!

🎁 حصلت على ${newPlayerReward} ذهب
👤 المدعو: ${referrer.name}
💰 مكافأة صاحب الكود: ${referrerReward} ذهب`
        };
    }

    // ✅ عرض معلومات الإحالة
    async showReferralInfo(player) {
        const code = await this.getOrCreateReferralCode(player);
        const referredCount = player.referralCount || 0;
        const referralRewards = referredCount * 500;

        let msg = `🎁 نظام الإحالة\n\n`;
        msg += `📢 كود الدعوة الخاص بك:\n`;
        msg += `   ${code}\n\n`;
        msg += `👥 عدد من دعوتهم: ${referredCount}\n`;
        msg += `💰 إجمالي مكافآتك: ${referralRewards} ذهب\n\n`;
        msg += `💡 كيف يعمل:\n`;
        msg += `• أرسل الكود لأصدقائك\n`;
        msg += `• عندما يسجلون، استخدمهم الأمر: تفعيل [الكود]\n`;
        msg += `• تحصل على 500 ذهب لكل صديق\n`;
        msg += `• صديقك يحصل على 200 ذهب\n\n`;

        if (player.referredBy) {
            msg += `✅ أنت من دعوة: ${player.referredByName || 'لاعب'}`;
        } else {
            msg += `💡 إذا دعاك أحد، استخدم: تفعيل [الكود]`;
        }

        return msg;
    }

    // ✅ المكافأة اليومية
    async claimDailyReward(player) {
        const today = new Date().toDateString();
        const lastClaim = player.lastDailyReward ? new Date(player.lastDailyReward).toDateString() : null;

        if (lastClaim === today) {
            return { error: '❌ لقد استلمت مكافأتك اليومية اليوم!\nعد غداً لمكافأة جديدة.' };
        }

        // حساب سلسلة الدخول
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = lastClaim === yesterday.toDateString();

        if (wasYesterday) {
            player.dailyStreak = (player.dailyStreak || 0) + 1;
        } else {
            player.dailyStreak = 1;
        }

        // تحديد المكافأة حسب السلسلة
        const baseReward = 50;
        const streakBonus = Math.min(player.dailyStreak * 10, 200); // حد أقصى 200
        const totalReward = baseReward + streakBonus;

        player.addGold(totalReward);
        player.lastDailyReward = new Date();

        // مكافآت إضافية كل 7 أيام
        let bonusMsg = '';
        if (player.dailyStreak % 7 === 0) {
            const bonusItem = this._getWeeklyBonus(player.dailyStreak / 7);
            if (bonusItem) {
                player.addItem(bonusItem.id, bonusItem.name, bonusItem.type, 1);
                bonusMsg = `\n🎁 مكافأة الأسبوع: ${bonusItem.name}!`;
            }
        }

        await player.save();

        return {
            success: true,
            message: `🎁 المكافأة اليومية

💰 الذهب: ${totalReward}
🔥 السلسلة: ${player.dailyStreak} يوم
📅 الأيام المتتالية تزيد المكافأة!${bonusMsg}

💡 عد غداً لسلسلة جديدة!`
        };
    }

    _getWeeklyBonus(weekNumber) {
        const bonuses = [
            { id: 'iron_bar', name: 'سبيكة حديدية', type: 'resource' },
            { id: 'silver_bar', name: 'سبيكة فضية', type: 'resource' },
            { id: 'gold_bar', name: 'سبيكة ذهبية', type: 'resource' },
            { id: 'platinum_bar', name: 'سبيكة بلاتين', type: 'resource' }
        ];
        return bonuses[Math.min(weekNumber - 1, bonuses.length - 1)];
    }

    // ✅ عرض سلسلة الدخول
    async showDailyStreak(player) {
        const streak = player.dailyStreak || 0;
        const lastReward = player.lastDailyReward;
        const today = new Date().toDateString();
        const lastClaim = lastReward ? new Date(lastReward).toDateString() : null;
        const canClaim = lastClaim !== today;

        let msg = `🔥 سلسلة الدخول\n\n`;
        msg += `📅 السلسلة الحالية: ${streak} يوم\n`;
        msg += `💰 مكافأة الغد: ${50 + Math.min((streak + 1) * 10, 200)} ذهب\n\n`;

        if (canClaim) {
            msg += `✅ يمكنك استلام مكافأة اليوم!\n`;
            msg += `💡 استخدم: مكافأة`;
        } else {
            msg += `⏳ عد غداً لمكافأة جديدة.\n`;
        }

        if (streak > 0 && streak % 7 === 0) {
            msg += `\n🎉 أنت في أسبوع مكافأة! استمر!`;
        }

        return msg;
    }
}
