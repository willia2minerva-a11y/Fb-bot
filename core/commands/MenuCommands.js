// core/commands/MenuCommands.js
import { BaseCommand } from './BaseCommand.js';

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
            '8': this.handleMenu8.bind(this),
            'الأساسية': this.handleMenu1.bind(this),
            'الاستكشاف': this.handleMenu2.bind(this),
            'القتال': this.handleMenu3.bind(this),
            'الصناعة': this.handleMenu4.bind(this),
            'المعلومات': this.handleMenu5.bind(this),
            'الاقتصاد': this.handleMenu6.bind(this),
            'البوابات': this.handleMenu7.bind(this),
            'الإحالة': this.handleMenu8.bind(this),
            'المكافآت': this.handleMenu8.bind(this)
        };
    }

    async handleMainMenu(player) {
        if (!player.isApproved()) return this.getLimitedMenu();
        return this.getMenu('main');
    }

    async handleMenu1(player) { return player.isApproved() ? this.getMenu('basic') : this.getLimitedMenu(); }
    async handleMenu2(player) { return player.isApproved() ? this.getMenu('exploration') : this.getLimitedMenu(); }
    async handleMenu3(player) { return player.isApproved() ? this.getMenu('combat') : this.getLimitedMenu(); }
    async handleMenu4(player) { return player.isApproved() ? this.getMenu('crafting') : this.getLimitedMenu(); }
    async handleMenu5(player) { return player.isApproved() ? this.getMenu('info') : this.getLimitedMenu(); }
    async handleMenu6(player) { return player.isApproved() ? this.getMenu('economy') : this.getLimitedMenu(); }
    async handleMenu7(player) { return player.isApproved() ? this.getMenu('gates') : this.getLimitedMenu(); }
    async handleMenu8(player) { return player.isApproved() ? this.getMenu('referral') : this.getLimitedMenu(); }

    async handleHelp(player) {
        return player.isApproved() ? this.getMenu('main') : this.getLimitedHelpMenu();
    }

    getLimitedMenu() {
        return `🎮 القائمة المحدودة

📋 الأوامر المتاحة:
• بدء - متابعة التسجيل
• حالتي - عرض حالتك
• معرفي - عرض معرفك
• مساعدة - عرض الأوامر

📝 لتصبح لاعباً كاملاً:
1. الحصول على موافقة المدير
2. اختيار الجنس
3. اختيار الاسم`;
    }

    getLimitedHelpMenu() {
        return this.getLimitedMenu();
    }

    getMenu(type) {
        const marketUrl = this.commandHandler?.marketPageUrl || 'https://facebook.com/souqrio';

        const menus = {
            main: `🎮 قائمة أوامر مغارة ريو

📋 الأساسية
• بدء | حالتي | معرفي | مساعدة

🗺️ الاستكشاف
• خريطة | انتقل | تجميع

⚔️ القتال
• قتال | هجوم | هروب

🔨 الصناعة
• صناعة | اصنع | فرن | صهر | طهو

📊 المعلومات
• حالتي | بروفايل | حقيبة

💰 الاقتصاد
• رصيد - عرض رصيدك

🛒 للشراء والتحويل:
${marketUrl}

🚪 البوابات
• بوابات | ادخل | استكشف | مغادرة

🎁 الإحالة والمكافآت
• دعوة | تفعيل | مكافأة | سلسلة

🏆 المهام والإنجازات
• مهام | انجازات

💡 اكتب اسم الأمر مباشرة`,

            basic: `🎯 الأساسية

• بدء - بدء اللعبة أو متابعة التسجيل
• معرفي - عرض معرفك للمدير
• ذكر / أنثى - اختيار الجنس
• اسمي [الاسم] - اختيار اسم إنجليزي

💡 رئيسية - العودة للقائمة`,

            exploration: `🗺️ الاستكشاف

• خريطة - عرض الخريطة
• بوابات - عرض البوابات القريبة
• ادخل [اسم البوابة] - دخول بوابة
• انتقل [مكان] - السفر
• تجميع - جمع الموارد
• اجمع [اسم المورد] - جمع مورد محدد

💡 رئيسية - العودة`,

            combat: `⚔️ القتال

• قتال - بدء معركة
• هجوم - الهجوم في المعركة
• هروب - الهروب من المعركة

💡 رئيسية - العودة`,

            crafting: `🔨 الصناعة

• صناعة - عرض الوصفات
• اصنع [اسم] - صنع عنصر
• فرن - وصفات الفرن
• صهر [خام] - صهر خام
• طهو [طعام] - طهو طعام

💡 رئيسية - العودة`,

            info: `📊 المعلومات

• حالتي - الحالة الكاملة
• بروفايل - البروفايل
• حقيبة - عرض المخزون
• توب - أفضل اللاعبين

💡 رئيسية - العودة`,

            economy: `💰 الاقتصاد

• رصيد - عرض رصيدك في سوق ريو

🛒 لاستخدام رصيدك:
${marketUrl}

📋 أوامر السوق:
• متجر | شراء | تحويل
• هدية | خصم | بطاقة

💡 رئيسية - العودة`,

            gates: `🚪 البوابات

• بوابات - عرض البوابات
• بوابتي - معلومات البوابة الحالية
• ادخل [اسم] - دخول بوابة
• استكشف - استكشاف
• اختر [رقم] - اختيار مسار
• مغادرة - مغادرة البوابة

💡 رئيسية - العودة`,

            referral: `🎁 الإحالة والمكافآت

• دعوة / كودي - عرض كود الدعوة
• تفعيل [الكود] - استخدام كود دعوة
• مكافأة / يومي - استلام المكافأة اليومية
• سلسلة - عرض سلسلة الدخول

💰 المكافآت:
• دعوة صديق: 50 ريو لك + 20 ريو له
• المكافأة اليومية: 5-30 ريو

💡 رئيسية - العودة`
        };
        return menus[type] || menus.main;
    }
}
