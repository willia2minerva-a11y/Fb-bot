// core/CommandHandler.js
import Player from './Player.js';
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js';
import { AdminSystem } from '../systems/admin/AdminSystem.js';
import { RegistrationCommands } from './commands/RegistrationCommands.js';
import { GateCommands } from './commands/GateCommands.js';
import { BattleCommands } from './commands/BattleCommands.js';
import { EconomyCommands } from './commands/EconomyCommands.js';
import { CraftingCommands } from './commands/CraftingCommands.js';
import { ExplorationCommands } from './commands/ExplorationCommands.js';
import { InfoCommands } from './commands/InfoCommands.js';
import { MenuCommands } from './commands/MenuCommands.js';
import { AchievementCommands } from './commands/AchievementCommands.js';
import { ReferralCommands } from './commands/ReferralCommands.js';
import { SystemLoader } from './utils/SystemLoader.js';
import { ArabicItemMap } from './utils/ArabicItemMap.js';

export default class CommandHandler {
    constructor() {
        console.log('🔄 تهيئة CommandHandler...');

        try {
            this.adminSystem = new AdminSystem();
            this.cardGenerator = new ProfileCardGenerator();
            this.systems = {};
            this.ARABIC_ITEM_MAP = ArabicItemMap.create();

            this.adminProfileUrl = process.env.ADMIN_PROFILE_URL || 'https://www.facebook.com/';
            this.adminDisplayName = process.env.ADMIN_DISPLAY_NAME || 'المدير';
            // ✅ رابط سوق ريو
            this.marketPageUrl = process.env.MARKET_PAGE_URL || 'https://facebook.com/souqrio';

            this.initCommandClasses();
            this.commands = this.collectAllCommands();

            this.allowedBeforeApproval = [
                'بدء', 'معرفي', 'مساعدة', 'اوامر', 'حالتي', 'حالة',
                'ذكر', 'انثى', 'أنثى', 'اسمي'
            ];

            console.log('✅ CommandHandler تم تهيئته بنجاح');
            console.log('📋 الأوامر المسجلة:', Object.keys(this.commands).length);
        } catch (error) {
            console.error('❌ فشل في تهيئة CommandHandler:', error);
            throw error;
        }
    }

    initCommandClasses() {
        try {
            this.registrationCommands = new RegistrationCommands(this);
            this.gateCommands = new GateCommands(this);
            this.battleCommands = new BattleCommands(this);
            this.economyCommands = new EconomyCommands(this);
            this.craftingCommands = new CraftingCommands(this);
            this.explorationCommands = new ExplorationCommands(this);
            this.infoCommands = new InfoCommands(this);
            this.menuCommands = new MenuCommands(this);
            this.achievementCommands = new AchievementCommands(this);
            this.referralCommands = new ReferralCommands(this);
            console.log('✅ تم تهيئة جميع فئات الأوامر');
        } catch (error) {
            console.error('❌ خطأ في تهيئة فئات الأوامر:', error);
            throw error;
        }
    }

    collectAllCommands() {
        const allCommands = {};

        try {
            const commandSources = [
                this.menuCommands,
                this.registrationCommands,
                this.infoCommands,
                this.explorationCommands,
                this.gateCommands,
                this.craftingCommands,
                this.battleCommands,
                this.economyCommands,
                this.achievementCommands,
                this.referralCommands
            ];

            commandSources.forEach(source => {
                if (source && typeof source.getCommands === 'function') {
                    const commands = source.getCommands();
                    if (commands) {
                        Object.assign(allCommands, commands);
                    }
                }
            });

            return allCommands;
        } catch (error) {
            console.error('❌ خطأ في تجميع الأوامر:', error);
            return {};
        }
    }

    async getSystem(systemName) {
        try {
            if (!this.systems[systemName]) {
                console.log(`🔄 جاري تحميل النظام: ${systemName}`);
                this.systems[systemName] = await SystemLoader.loadSystem(systemName);

                if (!this.systems[systemName]) {
                    console.error(`❌ فشل تحميل النظام: ${systemName}`);
                    return null;
                }

                if (typeof this.systems[systemName].setCommandHandler === 'function') {
                    this.systems[systemName].setCommandHandler(this);
                }

                console.log(`✅ تم تحميل النظام: ${systemName}`);
            }
            return this.systems[systemName];
        } catch (error) {
            console.error(`❌ خطأ في تحميل النظام ${systemName}:`, error);
            return null;
        }
    }

    getRegistrationMessage(player) {
        const status = player.registrationStatus;
        const adminLink = this.adminProfileUrl;

        if (status === 'pending') {
            return `🔒 حسابك غير نشط

📩 يرجى مراسلة الأدمن لتفعيل حسابك:
${adminLink}

🆔 معرفك:
${player.playerId || player.userId}

📋 الأوامر المسموحة حالياً:
• حالتي
• معرفي
• مساعدة`;
        }

        if (status === 'approved') {
            return `✅ تمت الموافقة على حسابك

🎮 أكمل إنشاء شخصيتك في مغارة ريو:
• اكتب ذكر أو أنثى
• ثم اكتب اسمي [الاسم]

📋 الأوامر المسموحة:
• حالتي
• معرفي
• مساعدة`;
        }

        return this.getLimitedHelpMenu();
    }

    getLimitedHelpMenu() {
        return `🎮 مغارة ريو - الأوامر المتاحة

• بدء - متابعة التسجيل
• حالتي - عرض حالتك
• معرفي - عرض معرفك
• مساعدة - عرض الأوامر

📝 للتفعيل:
1. أرسل معرفك للأدمن
2. انتظر الموافقة
3. أكمل إنشاء شخصيتك`;
    }

    getLimitedMenu() {
        return this.getLimitedHelpMenu();
    }

    normalizeCommand(command) {
        if (!command) return command;
        return command.replace(/[_\s]/g, '');
    }

    async tryAdminCommand(command, args, id) {
        const isAdmin = await this.adminSystem.isAdminAsync(id);
        if (!isAdmin) return null;

        let result = await this.handleAdminCommand(command, args, id);
        if (result) return result;

        const normalized = this.normalizeCommand(command);
        if (normalized !== command) {
            result = await this.handleAdminCommand(normalized, args, id);
            if (result) return result;
        }

        return null;
    }

    async process(sender, message) {
        const { id, name, platform } = sender;
        const processedMessage = message.trim().toLowerCase();

        let commandParts = processedMessage.split(/\s+/);
        let command = commandParts[0];
        let args = commandParts.slice(1);

        // ✅ محاولة دمج الكلمات للأوامر المركبة
        let fullCommandAttempt = command;
        let remainingArgs = [...args];

        for (let i = Math.min(3, args.length); i >= 1; i--) {
            const attempt = command + ' ' + args.slice(0, i).join(' ');
            if (this.isCompoundCommand(attempt)) {
                fullCommandAttempt = attempt;
                remainingArgs = args.slice(i);
                break;
            }
        }

        if (this.isCompoundCommand(fullCommandAttempt)) {
            const result = this.handleCompoundCommand(fullCommandAttempt);
            command = result.command;
            args = result.args.concat(remainingArgs);
        }

        console.log(`📨 أمر: "${command}" من ${name} (${id})`);

        // ✅ جلب/إنشاء اللاعب
        let player = null;
        try {
            player = await Player.findOne({ userId: id });
            if (!player) {
                player = await Player.createNew(id, name, platform || 'facebook');
                console.log(`🎮 لاعب جديد: ${player.name}`);
            }
        } catch (error) {
            console.error('❌ خطأ في جلب/إنشاء اللاعب:', error);
            return '❌ حدث خطأ.';
        }

        // ✅ فحص السجن
        if (player.isJailed()) {
            if (!player.jailNotified) {
                player.jailNotified = true;
                await player.save();

                const isPermanent = player.jailedUntil.getTime() === 0;
                const timeStr = isPermanent
                    ? '🚔 أنت مسجون بشكل دائم'
                    : `🚔 أنت مسجون حتى\n${player.jailedUntil.toLocaleString('ar-EG')}`;

                return `${timeStr}\n\n📝 السبب: ${player.jailedReason || 'غير محدد'}\n\n💡 لا يمكنك استخدام البوت أثناء السجن.`;
            }
            return null;
        }

        // ✅ فحص الحظر
        if (player.banned) {
            return '❌ تم حظرك من مغارة ريو.';
        }

        // ✅ فحص المدير
        const userIsAdmin = await this.adminSystem.isAdminAsync(id);
        if (userIsAdmin) {
            const adminResult = await this.tryAdminCommand(command, args, id);
            if (adminResult) return adminResult;
        }

        // ✅ الردود التلقائية
        const autoResponse = await this.handleAutoResponse(message);
        if (autoResponse) return autoResponse;

        try {
            if (userIsAdmin && player.registrationStatus !== 'completed') {
                player = await this.adminSystem.setupAdminPlayer(id, name);
            }

            if (!player.isApproved() && !this.allowedBeforeApproval.includes(command)) {
                return this.getRegistrationMessage(player);
            }

            const normalizedCommand = this.normalizeCommand(command);
            let handler = this.commands[command] || this.commands[normalizedCommand];

            if (handler) {
                const result = await handler.call(this, player, args, id);
                if (typeof result === 'string') {
                    await player.save();
                }
                return result;
            }

            return await this.handleUnknown(command, player);
        } catch (error) {
            console.error('❌ خطأ:', error);
            return `❌ حدث خطأ: ${error.message}`;
        }
    }

    isCompoundCommand(fullCommand) {
        const compoundCommands = [
            'اضف رد', 'ازل رد', 'عرض الردود',
            'اضف مهمة', 'حذف مهمة', 'قائمة المهام',
            'اضف سلاح', 'حذف سلاح', 'اضف وحش', 'حذف وحش',
            'اضف مورد', 'حذف مورد', 'عرض اسلحة', 'عرض وحوش',
            'عرض مواقع', 'عرض موارد', 'اعطاء ادمن', 'ازالة ادمن',
            'اعطاء صلاحية', 'ازالة صلاحية', 'قائمة الادمن',
            'قائمة المسجونين', 'اضافة غولد'
        ];
        return compoundCommands.includes(fullCommand);
    }

    handleCompoundCommand(fullCommand) {
        const commandMap = {
            'اضف رد': 'اضف_رد',
            'ازل رد': 'ازل_رد',
            'عرض الردود': 'عرض_الردود',
            'اضف مهمة': 'اضف_مهمة',
            'حذف مهمة': 'حذف_مهمة',
            'قائمة المهام': 'قائمة_المهام',
            'اضف سلاح': 'اضف_سلاح',
            'حذف سلاح': 'حذف_سلاح',
            'اضف وحش': 'اضف_وحش',
            'حذف وحش': 'حذف_وحش',
            'اضف مورد': 'اضف_مورد',
            'حذف مورد': 'حذف_مورد',
            'عرض اسلحة': 'عرض_اسلحة',
            'عرض وحوش': 'عرض_وحوش',
            'عرض مواقع': 'عرض_مواقع',
            'عرض موارد': 'عرض_موارد',
            'اعطاء ادمن': 'اعطاء_ادمن',
            'ازالة ادمن': 'ازالة_ادمن',
            'اعطاء صلاحية': 'اعطاء_صلاحية',
            'ازالة صلاحية': 'ازالة_صلاحية',
            'قائمة الادمن': 'قائمة_الادمن',
            'قائمة المسجونين': 'قائمة_المسجونين'
        };

        return {
            command: commandMap[fullCommand] || fullCommand,
            args: []
        };
    }

    async handleAdminCommand(command, args, userId) {
        try {
            let player = await Player.findOne({ userId });
            if (!player) player = await Player.createNew(userId, 'Admin');
            const result = await this.adminSystem.handleAdminCommand(command, args, userId, player, this.ARABIC_ITEM_MAP);
            return result;
        } catch (error) {
            console.error('❌ خطأ في أمر المدير:', error);
            return `❌ خطأ: ${error.message}`;
        }
    }

    async handleAutoResponse(message) {
        try {
            const autoResponseSys = await this.getSystem('autoResponse');
            if (autoResponseSys && typeof autoResponseSys.findAutoResponse === 'function') {
                return autoResponseSys.findAutoResponse(message);
            }
        } catch (error) {
            console.error('❌ خطأ في الرد التلقائي:', error);
        }
        return null;
    }

    async handleUnknown(command, player) {
        const gateHints = {
            'دخل': '💡 هل تقصد "ادخل [اسم البوابة]"؟',
            'استكشف': '💡 هل تقصد "استكشف"؟',
            'اختر': '💡 هل تقصد "اختر [رقم]"؟ مثال: اختر 1',
            'غادر': '💡 هل تقصد "مغادرة" أو "غادر"؟',
            'بوابة': '💡 هل تقصد "بوابات" أو "بوابتي"؟'
        };

        for (const [hintCommand, hintMessage] of Object.entries(gateHints)) {
            if (command.includes(hintCommand)) {
                return `${hintMessage}\n\n❓ أمر غير معروف: "${command}"\nاكتب "مساعدة" للقائمة الكاملة.`;
            }
        }

        return `❓ أمر غير معروف: "${command}"\n💡 اكتب "مساعدة" للقائمة الكاملة.`;
    }
                }
