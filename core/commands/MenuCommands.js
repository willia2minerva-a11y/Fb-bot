// core/commands/commands/MenuCommands.js
import { BaseCommand } from '../BaseCommand.js';

export class MenuCommands extends BaseCommand {
    getCommands() {
        return {
            'مساعدة': this.handleHelp.bind(this),
            'اوامر': this.handleHelp.bind(this),
            'رئيسية': this.handleMainMenu.bind(this),
            'الرئيسية': this.handleMainMenu.bind(this),
            '1': this.handleMenu1.bind(this),
            '2': this.handleMenu2.bind(this),
            '3': this.handleMenu3.bind(this),
            '4': this.handleMenu4.bind(this),
            '5': this.handleMenu5.bind(this),
            '6': this.handleMenu6.bind(this),
            '7': this.handleMenu7.bind(this),
            'الأساسية': this.handleMenu1.bind(this),
            'الاستكشاف': this.handleMenu2.bind(this),
            'القتال': this.handleMenu3.bind(this),
            'الصناعة': this.handleMenu4.bind(this),
            'المعلومات': this.handleMenu5.bind(this),
            'الاقتصاد': this.handleMenu6.bind(this),
            'البوابات': this.handleMenu7.bind(this)
        };
    }

    // 🆕 نظام القوائم المنظمة - محدودة للاعبين غير المكتملين
    async handleMainMenu(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('main');
    }

    async handleMenu1(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('basic');
    }

    async handleMenu2(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('exploration');
    }

    async handleMenu3(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('combat');
    }

    async handleMenu4(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('crafting');
    }

    async handleMenu5(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('info');
    }

    async handleHelp(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedHelpMenu();
        }
        return this.handleMainMenu(player, args, senderId);
    }

    async handleMenu6(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('economy');
    }

    async handleMenu7(player, args, senderId) {
        if (!player.isApproved()) {
            return this.getLimitedMenu();
        }
        return this.getMenu('gates');
    }

    // 🆕 نظام القوائم المنظمة الكاملة
    getMenu(menuType) {
        const menus = {
            main: `╔════════════ 🎮 قائمة الأوامر الرئيسية ════════════╗
║
║ 1️⃣ /الأساسية - أوامر البدء والتسجيل
║ 2️⃣ /الاستكشاف - أوامر التنقل والجمع  
║ 3️⃣ /القتال - أوامر المعارك والمغامرات
║ 4️⃣ /الصناعة - أوامر الصنع والتجهيز
║ 5️⃣ /المعلومات - أوامر الحالة والبروفايل
║ 6️⃣ /الاقتصاد - أوامر السحب والتحويل والايداع
║ 7️⃣ /البوابات - أوامر بوابات سولو والمغامرات
║
║ 📝 اختر رقم القائمة ( 1 , 2 , 3 , 4 , 5 , 6 , 7 )
║
╚══════════════════════════════════════════════════╝`,

            basic: `╔════════════ 🎯 الأوامر الأساسية ════════════╗
║
║ • بدء - بدء اللعبة أو متابعة التسجيل
║ • معرفي - عرض معرفك للمدير
║ • ذكر/أنثى - اختيار الجنس
║ • اسمي [الاسم] - اختيار اسم إنجليزي
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,

            exploration: `╔════════════ 🗺️ أوامر الاستكشاف ════════════╗
║
║ • خريطة/الموقع - عرض الخريطة الحالية
║ • بوابات - عرض البوابات القريبة
║ • ادخل [اسم البوابة] - دخول البوابة
║ • انتقل [مكان] - السفر إلى موقع
║ • تجميع/اجمع - جمع الموارد
║ • تجميع [اسم المورد] - جمع مورد محدد
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية  
║
╚══════════════════════════════════════════════╝`,

            combat: `╔════════════ ⚔️ أوامر القتال ════════════╗
║
║ • مغامرة/قتال - بدء معركة عشوائية
║ • هجوم/اضرب - الهجوم في المعركة
║ • هروب/اهرب - الهروب من المعركة
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,

            crafting: `╔════════════ 🛠️ أوامر الصناعة ════════════╗
║
║ • وصفات/صناعة - عرض الوصفات المتاحة
║ • اصنع [اسم العنصر] - صنع عنصر
║ • جهز [اسم العنصر] - تجهيز سلاح/درع
║ • انزع [اسم الخانة] - نزع عنصر مجهز
║ • معداتي - عرض المعدات المجهزة
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,

            info: `╔════════════ 📊 أوامر المعلومات ════════════╗
║
║ • حالتي/حالة - عرض الحالة الكاملة
║ • بروفايلي/بطاقة - عرض البروفايل
║ • حقيبتي/مخزن - عرض المحتويات
║ • توب/افضل - قائمة أفضل اللاعبين
║ • لاعبيين - عرض اللاعبين النشطين
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`,
            
            economy: `╔════════════ 💰 أوامر الاقتصاد ════════════╗
║
║ • رصيدي - عرض رصيد الغولد
║ • سحب [مبلغ] - سحب غولد (الحد 100)
║ • ايداع - إرشادات الإيداع
║ • تحويل [@player] [مبلغ] - تحويل غولد
║ • معاملاتي - سجل المعاملات
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية  
║
╚══════════════════════════════════════════════╝`,

            gates: `╔════════════ 🚪 أوامر البوابات ════════════╗
║
║ • بوابات - عرض البوابات المتاحة
║ • بوابتي - معلومات البوابة الحالية
║ • ادخل [اسم البوابة] - دخول بوابة
║ • استكشف/استكشاف - استكشاف داخل البوابة
║ • اختر [رقم] - اختيار مسار في القصة
║ • مغادرة/غادر - مغادرة البوابة
║
║ 🎯 أمثلة:
║ • "بوابات" - رؤية البوابات المتاحة
║ • "ادخل بوابة سولو" - دخول بوابة
║ • "استكشف" - بدء الاستكشاف
║ • "اختر 1" - اختيار المسار الأول
║
║ ◀️ /رئيسية - العودة للقائمة الرئيسية
║
╚══════════════════════════════════════════════╝`
        };
        return menus[menuType] || menus.main;
    }
}