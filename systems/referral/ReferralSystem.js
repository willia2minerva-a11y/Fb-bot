// systems/referral/ReferralSystem.js
import Player from '../../core/Player.js';

export class ReferralSystem {
    constructor() {
        // ✅ الإعدادات الجديدة (متوافقة مع Gold الحقيقي)
        this.MIN_ACCOUNT_AGE_MINUTES = 5;        // 5 دقائق بعد الموافقة
        this.MAX_ACCOUNT_AGE_HOURS = 24;          // 24 ساعة بعد الموافقة
        this.MAX_LEVEL_FOR_REFERRAL = 5;          // الحد الأقصى للمستوى
        this.DAILY_REFERRAL_LIMIT = 3;            // حد الدعوات اليومي
        this.REFERRER_REWARD = 50;                // مكافأة صاحب الكود
        this.NEW_PLAYER_REWARD = 20;              // مكافأة اللاعب الجديد

        // ✅ المكافأة اليومية
        this.BASE_DAILY_REWARD = 5;               // المكافأة الأساسية
        this.STREAK_BONUS_PER_DAY = 1;            // زيادة يومية
        this.MAX_STREAK_BONUS = 25;               // الحد الأقصى للبونص

        console.log('🎁 نظام الإحالة والمكافآت اليومية تم تهيئته');
    }

    // ✅ توليد كود دعوة فريد
    _generateReferralCode(playerId) {
        const numericPart = playerId.toString().slice(-5);
        const randomLetters = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `MG${numericPart}${randomLetters}`;
    }

    // ✅ الحصول على كود الإحالة أو إنشاؤه
    async getOrCreateReferralCode(player) {
        if (!player.referralCode) {
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

    // ✅ استخدام كود دعوة (الشروط الجديدة: 24 ساعة بعد الموافقة)
    async useReferralCode(player, code) {
        // 1. التحقق من صحة الكود
        if (!code || code.trim().length === 0) {
            return { error: '❌ اكتب كود الدعوة.' };
        }

        const cleanedCode = code.trim().toUpperCase();

        // 2. التحقق من عدم استخدام كود سابقاً
        if (player.referredBy) {
            return { error: '❌ لقد استخدمت كود دعوة مسبقاً!' };
        }

        // 3. التحقق من أن اللاعب ليس صاحب الكود
        if (player.referralCode === cleanedCode) {
            return { error: '❌ لا يمكنك استخدام كودك الخاص!' };
        }

        // 4. ✅ التحقق من أن اللاعب تمت الموافقة عليه
        if (!player.approvedAt) {
            return {
                error: `❌ لم تتم الموافقة على حسابك بعد!

💡 انتظر موافقة المدير أولاً.`
            };
        }

        // 5. ✅ التحقق من عمر الحساب (بعد الموافقة)
        const approvalTime = new Date(player.approvedAt).getTime();
        const accountAge = Date.now() - approvalTime;
        const accountAgeMinutes = accountAge / (1000 * 60);
        const accountAgeHours = accountAge / (1000 * 60 * 60);

        // 5.1 الحد الأدنى: 5 دقائق بعد الموافقة
        if (accountAgeMinutes < this.MIN_ACCOUNT_AGE_MINUTES) {
            const remaining = Math.ceil(this.MIN_ACCOUNT_AGE_MINUTES - accountAgeMinutes);
            return {
                error: `❌ انتظر ${remaining} دقيقة بعد الموافقة قبل استخدام الكود.`
            };
        }

        // 5.2 الحد الأقصى: 24 ساعة بعد الموافقة
        if (accountAgeHours > this.MAX_ACCOUNT_AGE_HOURS) {
            const remainingHours = Math.floor(accountAgeHours);
            return {
                error: `❌ انتهت صلاحية استخدام كود الدعوة!

💡 يُقبل الكود فقط خلال أول 24 ساعة من الموافقة على حسابك.
⏰ مر على موافقتك: ${remainingHours} ساعة`
            };
        }

        // 6. التحقق من مستوى اللاعب
        if (player.level > this.MAX_LEVEL_FOR_REFERRAL) {
            return {
                error: `❌ لا يمكنك استخدام كود الدعوة.

📊 الحد الأقصى للمستوى: ${this.MAX_LEVEL_FOR_REFERRAL}
📈 مستواك: ${player.level}`
            };
        }

        // 7. البحث عن صاحب الكود
        const referrer = await Player.findOne({ referralCode: cleanedCode });
        if (!referrer) {
            return { error: '❌ الكود غير صحيح أو غير موجود.' };
        }

        if (referrer.userId === player.userId) {
            return { error: '❌ لا يمكنك استخدام كودك الخاص!' };
        }

        // 8. التحقق من حد الدعوات اليومي لصاحب الكود
        const today = new Date().toDateString();
        const todayReferrals = (referrer.referredPlayers || []).filter(p => {
            return new Date(p.date).toDateString() === today;
        }).length;

        if (todayReferrals >= this.DAILY_REFERRAL_LIMIT) {
            return {
                error: `❌ صاحب الكود وصل للحد اليومي من الدعوات.

📊 الحد اليومي: ${this.DAILY_REFERRAL_LIMIT} دعوات
💡 جرب غداً.`
            };
        }

        // 9. منح المكافآت
        referrer.addGold(this.REFERRER_REWARD);
        referrer.referralCount = (referrer.referralCount || 0) + 1;

        if (!referrer.referredPlayers) referrer.referredPlayers = [];
        referrer.referredPlayers.push({
            userId: player.userId,
            name: player.name,
            date: new Date()
        });

        player.addGold(this.NEW_PLAYER_REWARD);
        player.referredBy = referrer.userId;
        player.referredByName = referrer.name;

        await referrer.save();
        await player.save();

        // 10. تحديث المهام والإنجازات
        try {
            const achievementSystem = this.commandHandler?.getSystem
                ? await this.commandHandler.getSystem('achievement')
                : null;

            if (achievementSystem) {
                await achievementSystem.updateTaskProgress(referrer, 'referral');
                await achievementSystem.checkAchievements(referrer);
                await referrer.save();
            }
        } catch (error) {
            console.error('❌ خطأ في تحديث الإنجازات:', error);
        }

        return {
            success: true,
            message: `✅ تم تفعيل كود الدعوة!

🎁 حصلت على ${this.NEW_PLAYER_REWARD} غولد
👤 المدعو: ${referrer.name}
💰 مكافأة صاحب الكود: ${this.REFERRER_REWARD} غولد

💡 استخدم كودك الخاص لدعوة أصدقائك!`
        };
    }

    // ✅ عرض معلومات الإحالة
    async showReferralInfo(player) {
        const code = await this.getOrCreateReferralCode(player);
        const referredCount = player.referralCount || 0;
        const referralRewards = referredCount * this.REFERRER_REWARD;

        const today = new Date().toDateString();
        const todayReferrals = (player.referredPlayers || []).filter(p => {
            return new Date(p.date).toDateString() === today;
        }).length;

        let msg = `🎁 نظام الإحالة\n\n`;
        msg += `📢 كود الدعوة الخاص بك:\n`;
        msg += `   ${code}\n\n`;
        msg += `👥 إجمالي المدعوين: ${referredCount}\n`;
        msg += `📅 دعوات اليوم: ${todayReferrals}/${this.DAILY_REFERRAL_LIMIT}\n`;
        msg += `💰 إجمالي مكافآتك: ${referralRewards} غولد\n\n`;
        msg += `📖 كيف يعمل:\n`;
        msg += `• أرسل الكود لأصدقائك\n`;
        msg += `• عندما يسجلون، استخدموا: تفعيل [الكود]\n`;
        msg += `• تحصل على ${this.REFERRER_REWARD} غولد لكل صديق\n`;
        msg += `• صديقك يحصل على ${this.NEW_PLAYER_REWARD} غولد\n\n`;
        msg += `⚙️ الشروط:\n`;
        msg += `• يُقبل الكود خلال 24 ساعة من الموافقة\n`;
        msg += `• المستوى 5 أو أقل\n`;
        msg += `• لم يستخدم كود دعوة سابقاً\n\n`;

        if (player.referredBy) {
            msg += `✅ أنت من دعوة: ${player.referredByName || 'لاعب'}`;
        } else {
            // التحقق من الوقت المتبقي
            if (player.approvedAt) {
                const approvalTime = new Date(player.approvedAt).getTime();
                const hoursPassed = (Date.now() - approvalTime) / (1000 * 60 * 60);
                if (hoursPassed > 24) {
                    msg += `❌ انتهت صلاحية استخدام الكود`;
                } else {
                    const remainingHours = Math.ceil(24 - hoursPassed);
                    msg += `⏰ متبقي لك: ${remainingHours} ساعة لاستخدام كود دعوة`;
                }
            } else {
                msg += `💡 إذا دعاك أحد، استخدم: تفعيل [الكود]`;
            }
        }

        return msg;
    }

    // ✅ المكافأة اليومية (مع أرقام جديدة)
    async claimDailyReward(player) {
        const today = new Date().toDateString();
        const lastClaim = player.lastDailyReward
            ? new Date(player.lastDailyReward).toDateString()
            : null;

        if (lastClaim === today) {
            return { error: '❌ استلمت مكافأتك اليومية!\nعد غداً لمكافأة جديدة.' };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = lastClaim === yesterday.toDateString();

        if (wasYesterday) {
            player.dailyStreak = (player.dailyStreak || 0) + 1;
        } else {
            player.dailyStreak = 1;
        }

        // تحديد المكافأة
        const streakBonus = Math.min(
            (player.dailyStreak - 1) * this.STREAK_BONUS_PER_DAY,
            this.MAX_STREAK_BONUS
        );
        const totalReward = this.BASE_DAILY_REWARD + streakBonus;

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

        // تحديث الإنجازات
        try {
            const achievementSystem = this.commandHandler?.getSystem
                ? await this.commandHandler.getSystem('achievement')
                : null;

            if (achievementSystem) {
                await achievementSystem.checkAchievements(player);
                await player.save();
            }
        } catch (error) {
            console.error('❌ خطأ في تحديث الإنجازات:', error);
        }

        return {
            success: true,
            message: `🎁 المكافأة اليومية

💰 الغولد: ${totalReward}
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
        return bonuses[Math.min(Math.floor(weekNumber) - 1, bonuses.length - 1)];
    }

    // ✅ عرض سلسلة الدخول
    async showDailyStreak(player) {
        const streak = player.dailyStreak || 0;
        const lastReward = player.lastDailyReward;
        const today = new Date().toDateString();
        const lastClaim = lastReward ? new Date(lastReward).toDateString() : null;
        const canClaim = lastClaim !== today;

        const tomorrowReward = this.BASE_DAILY_REWARD + Math.min(
            streak * this.STREAK_BONUS_PER_DAY,
            this.MAX_STREAK_BONUS
        );

        let msg = `🔥 سلسلة الدخول\n\n`;
        msg += `📅 السلسلة الحالية: ${streak} يوم\n`;
        msg += `💰 مكافأة الغد: ${tomorrowReward} غولد\n\n`;

        if (canClaim) {
            msg += `✅ يمكنك استلام مكافأة اليوم!\n`;
            msg += `💡 استخدم: مكافأة`;
        } else {
            msg += `⏳ عد غداً لمكافأة جديدة.`;
        }

        if (streak > 0 && streak % 7 === 0) {
            msg += `\n\n🎉 أنت في أسبوع مكافأة! استمر!`;
        }

        return msg;
    }

    // ✅ ربط commandHandler
    setCommandHandler(handler) {
        this.commandHandler = handler;
    }
                                                   }
