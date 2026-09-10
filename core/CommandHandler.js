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

            // ✅ ربط adminSystem بـ commandHandler
            if (typeof this.adminSystem.setCommandHandler === 'function') {
                this.adminSystem.setCommandHandler(this);
            }

            this.initCommandClasses();
            this.commands = this.collectAllCommands();

            this.allowedBeforeApproval = [
                'بدء', 'معرفي', 'مساعدة', 'اوامر', 'حالتي', 'حالة',
                'ذكر', 'انثى', 'أنثى', 'اسمي'
            ];

            console.log('✅ CommandHandler تم تهيئته بنجاح');
            console.log('📋 الأوامر المسجلة:', Object.keys(this.commands).join(', '));
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

🆔 أرسل له معرفك:
${player.userId}

📋 الأوامر المسموحة حالياً:
• حالتي
• معرفي
• مساعدة`;
        }

        if (status === 'approved') {
            return `✅ تمت الموافقة على حسابك

🎮 أكمل إنشاء شخصيتك:
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
        return `🎮 الأوامر المتاحة

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

    // ✅ تطبيع الأمر (إزالة الشرطات السفلية والمسافات)
    normalizeCommand(command) {
        if (!command) return command;
        return command.replace(/[_\s]/g, '');
    }

    // ✅ محاولة معالجة أمر مدير بأي شكل
    async tryAdminCommand(command, args, id) {
        // 1. مباشرة
        let result = await this.handleAdminCommand(command, args, id);
        if (result) return result;

        // 2. بدون شرطات سفلية
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

        // ✅ محاولة دمج الكلمات لعمل أوامر مركبة (مثل "موافقة لاعب")
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

        console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

        // ✅ فحص المدير
        const userIsAdmin = this.adminSystem.isAdmin(id);
        if (userIsAdmin) {
            const adminResult = await this.tryAdminCommand(command, args, id);
            if (adminResult) return adminResult;
        }

        const autoResponse = await this.handleAutoResponse(message);
        if (autoResponse) return autoResponse;

        try {
            const playerPlatform = platform || 'facebook';

            let player = await Player.findOne({ userId: id });
            if (!player) {
                player = await Player.createNew(id, name, playerPlatform);
                console.log(`🎮 تم إنشاء لاعب جديد: ${player.name} (${playerPlatform})`);
            }

            if (userIsAdmin && player.registrationStatus !== 'completed') {
                player = await this.adminSystem.setupAdminPlayer(id, name);
                console.log(`🎯 تم تفعيل المدير: ${player.name}`);
            }

            if (player.banned) {
                return '❌ تم حظرك من اللعبة.';
            }

            if (!player.isApproved() && !this.allowedBeforeApproval.includes(command)) {
                return this.getRegistrationMessage(player);
            }

            // ✅ محاولة الأوامر العادية (مع تطبيع)
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
            console.error('❌ خطأ في معالجة الأمر:', error);
            return `❌ حدث خطأ: ${error.message}`;
        }
    }

    isCompoundCommand(fullCommand) {
        const compoundCommands = [
            'موافقة لاعب', 'اعطاء مورد', 'اعطاء ذهب', 'تغيير اسم',
            'زيادة صحة', 'زيادة مانا', 'اعادة بيانات', 'حظر لاعب',
            'تغيير جنس', 'عرض الردود', 'حذف طلب سحب',
            'صناعة كاملة', 'فرن كاملة', 'اضف رد', 'ازل رد',
            'اضف مهمة', 'حذف مهمة', 'قائمة المهام',
            'اضف سلاح', 'حذف سلاح', 'اضف وحش', 'حذف وحش',
            'اضف مورد', 'حذف مورد', 'عرض اسلحة', 'عرض وحوش',
            'عرض مواقع', 'عرض موارد', 'اقتصاد لاعب', 'اضافة غولد',
            'طلبات سحب', 'معالجة سحب'
        ];
        return compoundCommands.includes(fullCommand);
    }

    handleCompoundCommand(fullCommand) {
        const commandMap = {
            'موافقة لاعب': 'موافقة_لاعب',
            'اعطاء مورد': 'اعطاء_مورد',
            'اعطاء ذهب': 'اعطاء_ذهب',
            'تغيير اسم': 'تغيير_اسم',
            'زيادة صحة': 'زيادة_صحة',
            'زيادة مانا': 'زيادة_مانا',
            'اعادة بيانات': 'اعادة_بيانات',
            'حظر لاعب': 'حظر_لاعب',
            'تغيير جنس': 'تغيير_جنس',
            'عرض الردود': 'عرض_الردود',
            'حذف طلب سحب': 'حذف_طلب_سحب',
            'صناعة كاملة': 'صناعة_كاملة',
            'فرن كاملة': 'فرن_كاملة',
            'اضف رد': 'اضف_رد',
            'ازل رد': 'ازل_رد',
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
            'اقتصاد لاعب': 'اقتصاد_لاعب',
            'اضافة غولد': 'اضافة_غولد',
            'طلبات سحب': 'طلبات_سحب',
            'معالجة سحب': 'معالجة_سحب'
        };

        return {
            command: commandMap[fullCommand] || fullCommand,
            args: []
        };
    }

    async handleAdminCommand(command, args, userId) {
        const adminCommands = this.adminSystem.getAdminCommands();
        if (adminCommands[command]) {
            console.log(`👑 تنفيذ أمر مدير: ${command}`);
            try {
                let player = await Player.findOne({ userId: userId });
                if (!player) {
                    player = await Player.createNew(userId, 'Admin');
                }
                const result = await this.adminSystem.handleAdminCommand(command, args, userId, player, this.ARABIC_ITEM_MAP);
                return result;
            } catch (error) {
                console.error('❌ خطأ في أمر المدير:', error);
                return `❌ خطأ في تنفيذ أمر المدير: ${error.message}`;
            }
        }
        return null;
    }

    async handleAutoResponse(message) {
        try {
            const autoResponseSys = await this.getSystem('autoResponse');
            if (autoResponseSys && typeof autoResponseSys.findAutoResponse === 'function') {
                const autoResponse = autoResponseSys.findAutoResponse(message);
                if (autoResponse) {
                    console.log(`🤖 رد تلقائي على: "${message}"`);
                    return autoResponse;
                }
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
