
// core/CommandHandler.js
import Player from './Player.js';

// 🛑 صحح مسارات utils - استخدم مساراً نسبياً صحيحاً
import { ProfileCardGenerator } from '../utils/ProfileCardGenerator.js'; // ✅
import { AdminSystem } from '../systems/admin/AdminSystem.js'; // ✅

// 🛑 صحح مسارات الأوامر - جميعها في مجلد commands/
import { RegistrationCommands } from './commands/RegistrationCommands.js'; // ✅
import { GateCommands } from './commands/GateCommands.js'; // ✅
import { BattleCommands } from './commands/BattleCommands.js'; // ✅
import { EconomyCommands } from './commands/EconomyCommands.js'; // ✅
import { CraftingCommands } from './commands/CraftingCommands.js'; // ✅
import { ExplorationCommands } from './commands/ExplorationCommands.js'; // ✅
import { InfoCommands } from './commands/InfoCommands.js'; // ✅
import { MenuCommands } from './commands/MenuCommands.js'; // ✅

// 🛑 صحح مسارات أدوات utils
import { SystemLoader } from './utils/SystemLoader.js'; // ✅
import { ArabicItemMap } from './utils/ArabicItemMap.js'; // ✅


export default class CommandHandler {
    constructor() {
        console.log('🔄 تهيئة CommandHandler...');

        try {
            this.adminSystem = new AdminSystem();
            this.cardGenerator = new ProfileCardGenerator();
            this.systems = {};

            // 🆕 خريطة الترجمة الشاملة
            this.ARABIC_ITEM_MAP = ArabicItemMap.create();

            // 🆕 تهيئة فئات الأوامر
            this.initCommandClasses();

            // 🆕 تجميع جميع الأوامر
            this.commands = this.collectAllCommands();

            this.allowedBeforeApproval = ['بدء', 'معرفي', 'مساعدة', 'اوامر', 'حالتي', 'حالة'];

            console.log('✅ CommandHandler تم تهيئته بنجاح');
        } catch (error) {
            console.error('❌ فشل في تهيئة CommandHandler:', error);
            throw error;
        }
    }

    // 🆕 تهيئة فئات الأوامر
    initCommandClasses() {
        this.registrationCommands = new RegistrationCommands(this);
        this.gateCommands = new GateCommands(this);
        this.battleCommands = new BattleCommands(this);
        this.economyCommands = new EconomyCommands(this);
        this.craftingCommands = new CraftingCommands(this);
        this.explorationCommands = new ExplorationCommands(this);
        this.infoCommands = new InfoCommands(this);
        this.menuCommands = new MenuCommands(this);
    }

    // 🆕 تجميع جميع الأوامر من الفئات المختلفة
    collectAllCommands() {
        return {
            // أوامر القوائم
            ...this.menuCommands.getCommands(),

            // أوامر التسجيل
            ...this.registrationCommands.getCommands(),

            // أوامر المعلومات
            ...this.infoCommands.getCommands(),

            // أوامر الاستكشاف
            ...this.explorationCommands.getCommands(),

            // أوامر البوابات
            ...this.gateCommands.getCommands(),

            // أوامر الصناعة
            ...this.craftingCommands.getCommands(),

            // أوامر القتال
            ...this.battleCommands.getCommands(),

            // أوامر الاقتصاد
            ...this.economyCommands.getCommands(),
        };
    }

    async getSystem(systemName) {
        if (!this.systems[systemName]) {
            console.log(`🔄 جاري تحميل النظام: ${systemName}`);
            this.systems[systemName] = await SystemLoader.loadSystem(systemName);

            if (!this.systems[systemName]) {
                console.log(`❌ فشل تحميل النظام: ${systemName}`);
            }
        }
        return this.systems[systemName];
    }

    // 🆕 دوال المساعدة للفئات الفرعية
    getRegistrationMessage(player) {
        const status = player.registrationStatus;

        if (status === 'pending') {
            return `❌ **حسابك غير مفعل بعد!**
            
⏳ **حالة حسابك:** قيد الانتظار للموافقة

📋 **الأوامر المتاحة لك حالياً:**
• \`بدء\` - متابعة التسجيل
• \`حالتي\` - عرض حالتك الحالية
• \`معرفي\` - عرض معرفك للمدير
• \`مساعدة\` - عرض الأوامر المتاحة

💡 **لتفعيل حسابك:**
1. اكتب "معرفي" للحصول على معرفك
2. أرسل المعرف للمدير لتفعيل حسابك
3. انتظر موافقة المدير`;
        } else if (status === 'approved') {
            return `✅ **تمت موافقة المدير على حسابك!**

📋 **الأوامر المتاحة لك حالياً:**
• \`بدء\` - إكمال إنشاء الشخصية
• \`حالتي\` - عرض حالتك الحالية
• \`مساعدة\` - عرض الأوامر المتاحة

🎮 **الآن يمكنك إكمال إنشاء شخصيتك:**
• اكتب "ذكر" 👦 أو "أنثى" 👧 لاختيار الجنس
• ثم اكتب "اسمي [الاسم]" لاختيار اسم إنجليزي`;
        }

        return this.getLimitedHelpMenu();
    }

    getLimitedHelpMenu() {
        return `╔══════════ 🎮 الأوامر المتاحة حالياً ══════════╗
║
║ • بدء - بدء التسجيل أو متابعة الإعداد
║ • حالتي/حالة - عرض حالتك الحالية
║ • معرفي - عرض معرفك لإرساله للمدير
║ • مساعدة - عرض هذه القائمة
║
║ 📝 **لتصبح لاعباً كاملاً، يجب:**
║ 1. الحصول على موافقة المدير
║ 2. اختيار الجنس (ذكر/أنثى)
║ 3. اختيار اسم إنجليزي
║
╚══════════════════════════════════════════════╝`;
    }

    getLimitedMenu() {
        return `╔══════════ 🎮 القائمة الرئيسية المحدودة ══════════╗
║
║ 📋 **الأوامر المتاحة لك حالياً:**
║
║ • بدء - بدء/متابعة التسجيل
║ • حالتي - عرض حالتك الحالية  
║ • معرفي - عرض المعرف للمدير
║ • مساعدة - عرض الأوامر المتاحة
║
║ 📝 **لتصبح لاعباً كاملاً، يجب:**
║ 1. الحصول على موافقة المدير
║ 2. اختيار الجنس (ذكر/أنثى)
║ 3. اختيار اسم إنجليزي
║
╚══════════════════════════════════════════════╝`;
    }

    async process(sender, message) {
        const { id, name } = sender;
        const processedMessage = message.trim().toLowerCase();

        let commandParts = processedMessage.split(/\s+/);
        let command = commandParts[0];
        let args = commandParts.slice(1);

        // معالجة الأوامر المركبة
        const fullCommand = command + (args[0] ? ` ${args[0]}` : '');
        if (this.isCompoundCommand(fullCommand)) {
            const result = this.handleCompoundCommand(fullCommand, commandParts);
            command = result.command;
            args = result.args;
        }

        console.log(`📨 معالجة أمر: "${command}" من ${name} (${id})`);

        // معالجة أوامر المدير أولاً
        const userIsAdmin = this.adminSystem.isAdmin(id);
        if (userIsAdmin) {
            const adminResult = await this.handleAdminCommand(command, args, id);
            if (adminResult) return adminResult;
        }

        // الردود التلقائية
        const autoResponse = await this.handleAutoResponse(message);
        if (autoResponse) return autoResponse;

        try {
            let player = await Player.findOne({ userId: id });
            if (!player) {
                player = await Player.createNew(id, name);
                console.log(`🎮 تم إنشاء لاعب جديد: ${player.name}`);
            }

            if (userIsAdmin && player.registrationStatus !== 'completed') {
                player = await this.adminSystem.setupAdminPlayer(id, name);
                console.log(`🎯 تم تفعيل المدير: ${player.name}`);
            }

            if (player.banned) {
                return '❌ تم حظرك من اللعبة.';
            }

            // التحقق من حالة اللاعب
            if (!player.isApproved() && !this.allowedBeforeApproval.includes(command)) {
                return this.getRegistrationMessage(player);
            }

            if (this.commands[command]) {
                const handler = this.commands[command];
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

    // 🆕 دوال مساعدة لمعالجة الأوامر
    isCompoundCommand(fullCommand) {
        const compoundCommands = [
            'موافقة لاعب', 'اعطاء مورد', 'اعطاء ذهب', 'تغيير اسم',
            'زيادة صحة', 'زيادة مانا', 'اعادة بيانات', 'حظر لاعب',
            'تغيير جنس', 'عرض الردود'
        ];
        return compoundCommands.includes(fullCommand);
    }

    handleCompoundCommand(fullCommand, commandParts) {
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
            'عرض الردود': 'عرض_الردود'
        };

        return {
            command: commandMap[fullCommand],
            args: commandParts.slice(2)
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
        const autoResponseSys = await this.getSystem('autoResponse');
        if (autoResponseSys) {
            const autoResponse = autoResponseSys.findAutoResponse(message);
            if (autoResponse) {
                console.log(`🤖 رد تلقائي على: "${message}"`);
                return autoResponse;
            }
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
