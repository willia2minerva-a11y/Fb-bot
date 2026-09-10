// core/commands/commands/AchievementCommands.js
import { BaseCommand } from './BaseCommand.js';

export class AchievementCommands extends BaseCommand {
    getCommands() {
        return {
            'مهام': this.handleDailyTasks.bind(this),
            'مهامي': this.handleDailyTasks.bind(this),
            'يومي': this.handleDailyTasks.bind(this),
            'انجازات': this.handleAchievements.bind(this),
            'إنجازات': this.handleAchievements.bind(this),
            'اضف_مهمة': this.handleAddTask.bind(this),
            'حذف_مهمة': this.handleRemoveTask.bind(this),
            'قائمة_المهام': this.handleListTasks.bind(this)
        };
    }

    async handleDailyTasks(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const achievementSystem = await this.getSystem('achievement');
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        return await achievementSystem.showDailyTasks(player);
    }

    async handleAchievements(player) {
        const approvalCheck = await this.checkPlayerApproval(player);
        if (approvalCheck.error) return approvalCheck.error;

        const achievementSystem = await this.getSystem('achievement');
        if (!achievementSystem) return '❌ نظام الإنجازات غير متوفر.';

        return await achievementSystem.showAchievements(player);
    }

    // ✅ إضافة مهمة (للأدمن فقط)
    async handleAddTask(player, args) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        if (args.length < 4) {
            return `❌ الاستخدام: اضف_مهمة [الاسم] [النوع] [الهدف] [المكافأة]

📝 الأنواع المتاحة:
• gather - جمع الموارد
• kill - قتل الوحوش
• craft - الصناعة
• travel - السفر
• earn_gold - كسب الذهب
• use_stamina - استخدام النشاط

مثال: اضف_مهمة "اقتل 5 وحوش" kill 5 40`;
        }

        const reward = parseInt(args[args.length - 1]);
        const target = parseInt(args[args.length - 2]);
        const type = args[args.length - 3];
        const name = args.slice(0, -3).join(' ').replace(/["']/g, '');

        if (isNaN(target) || isNaN(reward) || target <= 0 || reward <= 0) {
            return '❌ الهدف والمكافأة يجب أن يكونا أرقاماً صحيحة.';
        }

        const validTypes = ['gather', 'kill', 'craft', 'travel', 'earn_gold', 'use_stamina'];
        if (!validTypes.includes(type)) {
            return `❌ النوع "${type}" غير صالح.\nالأنواع المتاحة: ${validTypes.join(', ')}`;
        }

        const achievementSystem = await this.getSystem('achievement');
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        await achievementSystem.addCustomTask(name, type, target, reward);
        return `✅ تم إضافة المهمة: ${name}\n🎯 النوع: ${type}\n📊 الهدف: ${target}\n💰 المكافأة: ${reward} ذهب`;
    }

    // ✅ حذف مهمة (للأدمن فقط)
    async handleRemoveTask(player, args) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const taskId = args.join(' ');
        if (!taskId) {
            return '❌ الاستخدام: حذف_مهمة [معرف_المهمة]\n\n💡 استخدم "قائمة_المهام" لرؤية المعرفات.';
        }

        const achievementSystem = await this.getSystem('achievement');
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        const removed = await achievementSystem.removeCustomTask(taskId);
        
        if (removed) {
            return `✅ تم حذف المهمة: ${taskId}`;
        } else {
            return `❌ لم يتم العثور على المهمة: ${taskId}`;
        }
    }

    // ✅ عرض قائمة المهام المخصصة (للأدمن فقط)
    async handleListTasks(player) {
        if (!this.commandHandler?.adminSystem?.isAdmin(player.userId)) {
            return '❌ هذا الأمر خاص بالمدراء فقط.';
        }

        const achievementSystem = await this.getSystem('achievement');
        if (!achievementSystem) return '❌ نظام المهام غير متوفر.';

        const tasks = await achievementSystem.listCustomTasks();

        if (tasks.length === 0) {
            return `📋 لا توجد مهام مخصصة حالياً.

💡 لإضافة مهمة:
اضف_مهمة [الاسم] [النوع] [الهدف] [المكافأة]`;
        }

        let msg = `📋 المهام المخصصة (${tasks.length})\n`;

        tasks.forEach(task => {
            msg += `\n📌 ${task.name}\n`;
            msg += `   🆔 المعرف: ${task.id}\n`;
            msg += `   🎯 النوع: ${task.type}\n`;
            msg += `   📊 الهدف: ${task.target}\n`;
            msg += `   💰 المكافأة: ${task.reward} ذهب\n`;
        });

        msg += `\n💡 لحذف مهمة: حذف_مهمة [المعرف]`;
        return msg;
    }
}
