// core/commands/RegistrationCommands.js
// الموقع: مغارة ريو
import { BaseCommand } from './BaseCommand.js';

export class RegistrationCommands extends BaseCommand {
    getCommands() {
        return {
            // ===== بدء =====
            'بدء': this.handleStart.bind(this),
            'ابدأ': this.handleStart.bind(this),
            'ابدء': this.handleStart.bind(this),
            'ابد': this.handleStart.bind(this),
            'start': this.handleStart.bind(this),

            // ===== تسجيل دخول =====
            'دخول': this.handleLoginStart.bind(this),
            'تسجيل دخول': this.handleLoginStart.bind(this),
            'تسجيل_دخول': this.handleLoginStart.bind(this),
            'تسجيلالدخول': this.handleLoginStart.bind(this),
            'لدي حساب': this.handleLoginStart.bind(this),
            'لدي_حساب': this.handleLoginStart.bind(this),
            'لديحساب': this.handleLoginStart.bind(this),

            // ===== إنشاء حساب =====
            'انشاء': this.handleRegisterStart.bind(this),
            'إنشاء': this.handleRegisterStart.bind(this),
            'تسجيل': this.handleRegisterStart.bind(this),
            'حساب جديد': this.handleRegisterStart.bind(this),
            'حساب_جديد': this.handleRegisterStart.bind(this),
            'حسابجديد': this.handleRegisterStart.bind(this),

            // ===== إلغاء =====
            'الغاء': this.handleCancel.bind(this),
            'إلغاء': this.handleCancel.bind(this),
            'cancel': this.handleCancel.bind(this),

            // ===== تسجيل خروج =====
            'تسجيل خروج': this.handleLogout.bind(this),
            'تسجيل_خروج': this.handleLogout.bind(this),
            'تسجيلخروج': this.handleLogout.bind(this),
            'خروج': this.handleLogout.bind(this),
            'logout': this.handleLogout.bind(this),

            // ===== معرفي / حسابي =====
            'معرفي': this.handleGetId.bind(this),
            'معرف': this.handleGetId.bind(this),
            'حسابي': this.handleGetAccount.bind(this),
            'معلوماتي': this.handleGetAccount.bind(this)
        };
    }

    // ===================================
    // بدء - عرض القائمة
    // ===================================
    async handleStart(player, args, senderId) {
        return await this._handleStartFlow(player, senderId);
    }

    async _handleStartFlow(player, senderId) {
        const accountSystem = await this.getSystem('account');
        if (!accountSystem) return '❌ نظام الحسابات غير متوفر.';

        const hasAccount = await accountSystem.hasAccount(senderId);
        if (hasAccount) {
            return this._getWelcomeBackMessage(player);
        }

        const isLinked = await accountSystem.isLinkedButLoggedOut(senderId);
        if (isLinked) {
            return `👋 مرحباً بعودتك إلى مغارة ريو!

🔒 أنت مسجل خروج من هذه المنصة.

💡 اكتب "دخول" لتسجيل الدخول من جديد.`;
        }

        return accountSystem.getWelcomeMessage(player?.platform || 'facebook');
    }

    // ===================================
    // 🏔️ رسالة الترحيب بالعائد - مغارة ريو
    // ===================================
    _getWelcomeBackMessage(player) {
        const locationName = this._getLocationName(player.currentLocation);
        const gameUrl = process.env.GAME_PAGE_URL || 'https://facebook.com/MgaraRio';
        const marketUrl = process.env.MARKET_PAGE_URL || 'https://facebook.com/SouqRio';

        return `🏔️ مرحباً ${player.username} في مغارة ريو!

📊 معلوماتك:
• المستوى: ${player.level}
• الرصيد: ${player.gold} ريو
• الموقع: ${locationName}
• ID: ${player.playerId}

🎮 ماذا تريد أن تفعل؟
• "استكشف" — بدء الاستكشاف
• "شخصيتي" — معلوماتك الكاملة
• "مهامي" — المهام المتاحة
• "بواباتي" — البوابات المتاحة
• "مساعدة" — كل الأوامر

🛒 للتسوق: ${marketUrl}`;
    }

    // ===================================
    // بدء تسجيل دخول
    // ===================================
    async handleLoginStart(player, args, senderId) {
        const accountSystem = await this.getSystem('account');
        if (!accountSystem) return '❌ نظام الحسابات غير متوفر.';

        if (await accountSystem.hasAccount(senderId)) {
            return `✅ أنت مسجل دخول بالفعل يا ${player.username}.\n\n💡 اكتب "مساعدة" للأوامر.`;
        }

        const result = await accountSystem.startLogin(
            senderId,
            player?.platform || 'facebook',
            player?.name || null
        );

        return result.message;
    }

    // ===================================
    // بدء إنشاء حساب
    // ===================================
    async handleRegisterStart(player, args, senderId) {
        const accountSystem = await this.getSystem('account');
        if (!accountSystem) return '❌ نظام الحسابات غير متوفر.';

        if (await accountSystem.hasAccount(senderId)) {
            return `✅ لديك حساب بالفعل يا ${player.username}.\n\n💡 اكتب "تسجيل خروج" أولاً إذا أردت إنشاء حساب آخر.`;
        }

        const result = await accountSystem.startRegistration(
            senderId,
            player?.platform || 'facebook',
            player?.name || null
        );

        return result.message;
    }

    // ===================================
    // إلغاء
    // ===================================
    async handleCancel(player, args, senderId) {
        const accountSystem = await this.getSystem('account');
        if (!accountSystem) return '❌ نظام الحسابات غير متوفر.';

        accountSystem.cancelAllSessions(senderId);
        return '❌ تم إلغاء العملية.\n\n💡 اكتب "بدء" للبدء من جديد.';
    }

    // ===================================
    // تسجيل خروج
    // ===================================
    async handleLogout(player, args, senderId) {
        const accountSystem = await this.getSystem('account');
        if (!accountSystem) return '❌ نظام الحسابات غير متوفر.';

        if (!await accountSystem.hasAccount(senderId)) {
            return '❌ أنت غير مسجل دخول.\n\n💡 اكتب "بدء" للدخول أو إنشاء حساب.';
        }

        if (this.commandHandler?.adminSystem?.isRootAdmin?.(senderId)) {
            return '❌ لا يمكنك تسجيل الخروج كأدمن رئيسي.';
        }

        const result = await accountSystem.logout(player, senderId);

        return result.message;
    }

    // ===================================
    // معرفي
    // ===================================
    async handleGetId(player, args, senderId) {
        if (!player || !player.username) {
            return `🆔 معرفك في المنصة: ${senderId}\n\n💡 ليس لديك حساب بعد.`;
        }

        return `🆔 معلومات حسابك في مغارة ريو

👤 اسم المستخدم: ${player.username}
🎯 معرف اللاعب: ${player.playerId}
📱 معرف المنصة: ${senderId}`;
    }

    // ===================================
    // 🏔️ حسابي - مغارة ريو
    // ===================================
    async handleGetAccount(player, args, senderId) {
        if (!player || !player.username) {
            return `❌ ليس لديك حساب بعد.\n\n💡 اكتب "بدء" للإنشاء.`;
        }

        const platforms = (player.linkedPlatforms || []).map(p => {
            const platformName = p.platform === 'telegram' ? 'تلغرام' : 'فيسبوك';
            return `• ${platformName}: ${p.platformId}`;
        }).join('\n');

        const locationName = this._getLocationName(player.currentLocation);
        const marketUrl = process.env.MARKET_PAGE_URL || 'https://facebook.com/SouqRio';

        return `👤 حسابك في مغارة ريو

🆔 اسم المستخدم: ${player.username}
🎯 معرف اللاعب: ${player.playerId}
⚧️ الجنس: ${player.gender === 'male' ? 'ذكر 👦' : 'أنثى 👧'}

📊 المستوى: ${player.level}
💰 الرصيد: ${player.gold} ريو
📍 الموقع: ${locationName}
❤️ الصحة: ${player.health || 'N/A'}

📱 المنصات المرتبطة:
${platforms || 'لا يوجد'}

🛒 سوق ريو: ${marketUrl}

💡 لتسجيل الخروج: "تسجيل خروج"`;
    }

    // ===================================
    // أدوات مساعدة
    // ===================================
    _getLocationName(locationId) {
        const names = {
            'forest': 'الغابة', 'desert': 'الصحراء',
            'mountain': 'الجبل', 'cave': 'الكهف',
            'plains': 'السهول', 'village': 'القرية'
        };
        return names[locationId] || locationId;
    }
}
