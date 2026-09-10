// systems/achievements/AchievementSystem.js
import mongoose from 'mongoose';

const customTaskSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    target: { type: Number, required: true },
    reward: { type: Number, default: 20 },
    isDaily: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const CustomTask = mongoose.models.CustomTask || mongoose.model('CustomTask', customTaskSchema);

export class AchievementSystem {
    constructor() {
        this.dailyTaskPool = [
            // جمع الموارد
            { id: 'gather_3', name: 'اجمع 3 موارد', type: 'gather', target: 3, reward: 15 },
            { id: 'gather_5', name: 'اجمع 5 موارد', type: 'gather', target: 5, reward: 25 },
            { id: 'gather_10', name: 'اجمع 10 موارد', type: 'gather', target: 10, reward: 40 },
            { id: 'gather_15', name: 'اجمع 15 مورد', type: 'gather', target: 15, reward: 55 },

            // القتل
            { id: 'kill_2', name: 'اقتل وحشين', type: 'kill', target: 2, reward: 25 },
            { id: 'kill_3', name: 'اقتل 3 وحوش', type: 'kill', target: 3, reward: 35 },
            { id: 'kill_5', name: 'اقتل 5 وحوش', type: 'kill', target: 5, reward: 50 },
            { id: 'kill_10', name: 'اقتل 10 وحوش', type: 'kill', target: 10, reward: 80 },

            // الصناعة
            { id: 'craft_1', name: 'اصنع عنصراً', type: 'craft', target: 1, reward: 20 },
            { id: 'craft_2', name: 'اصنع عنصرين', type: 'craft', target: 2, reward: 35 },
            { id: 'craft_3', name: 'اصنع 3 عناصر', type: 'craft', target: 3, reward: 50 },
            { id: 'craft_5', name: 'اصنع 5 عناصر', type: 'craft', target: 5, reward: 75 },

            // السفر
            { id: 'travel_1', name: 'سافر إلى مكان جديد', type: 'travel', target: 1, reward: 15 },
            { id: 'travel_2', name: 'سافر مرتين', type: 'travel', target: 2, reward: 25 },
            { id: 'travel_3', name: 'سافر 3 مرات', type: 'travel', target: 3, reward: 40 },

            // كسب الذهب
            { id: 'earn_gold_100', name: 'اكسب 100 ذهب', type: 'earn_gold', target: 100, reward: 15 },
            { id: 'earn_gold_200', name: 'اكسب 200 ذهب', type: 'earn_gold', target: 200, reward: 25 },
            { id: 'earn_gold_500', name: 'اكسب 500 ذهب', type: 'earn_gold', target: 500, reward: 40 },

            // استخدام النشاط
            { id: 'use_stamina_20', name: 'استهلك 20 نشاط', type: 'use_stamina', target: 20, reward: 20 },
            { id: 'use_stamina_50', name: 'استهلك 50 نشاط', type: 'use_stamina', target: 50, reward: 35 },

            // ✅ مهام الإحالة
            { id: 'invite_1', name: 'ادعُ صديقاً واحداً', type: 'referral', target: 1, reward: 50 },
            { id: 'invite_2', name: 'ادعُ صديقين', type: 'referral', target: 2, reward: 100 },
        ];

        this.achievements = [
            { id: 'first_kill', name: 'أول قتيل', description: 'اقتل أول وحش', type: 'kill', target: 1, reward: 50 },
            { id: 'kill_50', name: 'صياد الوحوش', description: 'اقتل 50 وحشاً', type: 'kill', target: 50, reward: 300 },
            { id: 'kill_200', name: 'مبيد الوحوش', description: 'اقتل 200 وحش', type: 'kill', target: 200, reward: 1500 },
            { id: 'gather_100', name: 'جامع الموارد', description: 'اجمع 100 مورد', type: 'gather', target: 100, reward: 200 },
            { id: 'gather_500', name: 'سيد الموارد', description: 'اجمع 500 مورد', type: 'gather', target: 500, reward: 1000 },
            { id: 'craft_20', name: 'الصانع الماهر', description: 'اصنع 20 عنصراً', type: 'craft', target: 20, reward: 250 },
            { id: 'craft_100', name: 'الحرفي الأسطوري', description: 'اصنع 100 عنصر', type: 'craft', target: 100, reward: 1500 },
            { id: 'level_10', name: 'مغامر مبتدئ', description: 'وصل للمستوى 10', type: 'level', target: 10, reward: 100 },
            { id: 'level_30', name: 'مغامر خبير', description: 'وصل للمستوى 30', type: 'level', target: 30, reward: 500 },
            { id: 'level_50', name: 'مغامر محترف', description: 'وصل للمستوى 50', type: 'level', target: 50, reward: 1000 },
            { id: 'level_100', name: 'أسطورة', description: 'وصل للمستوى 100', type: 'level', target: 100, reward: 5000 },
            { id: 'gold_500', name: 'ثري', description: 'اجمع 500 ذهب', type: 'gold', target: 500, reward: 150 },
            { id: 'gold_5000', name: 'مليونير', description: 'اجمع 5000 ذهب', type: 'gold', target: 5000, reward: 1500 },
            
            // ✅ إنجازات الإحالة
            { id: 'referral_first', name: 'المدعو الأول', description: 'ادعُ أول صديق', type: 'referral', target: 1, reward: 200 },
            { id: 'referral_5', name: 'داعية المغامرين', description: 'ادعُ 5 أصدقاء', type: 'referral', target: 5, reward: 800 },
            { id: 'referral_10', name: 'قائد الفريق', description: 'ادعُ 10 أصدقاء', type: 'referral', target: 10, reward: 2000 },
            { id: 'streak_7', name: 'مثابر', description: 'حافظ على سلسلة 7 أيام', type: 'streak', target: 7, reward: 300 },
            { id: 'streak_30', name: 'أسطورة الالتزام', description: 'حافظ على سلسلة 30 يوم', type: 'streak', target: 30, reward: 1500 },
        ];

        console.log('🏆 نظام الإنجازات والمهام تم تهيئته');
    }

    _translateTaskType(input) {
        const typeMap = {
            'جمع': 'gather', 'اجمع': 'gather', 'موارد': 'gather', 'جمع_موارد': 'gather',
            'قتل': 'kill', 'اقتل': 'kill', 'وحوش': 'kill', 'قتال': 'kill',
            'صناعة': 'craft', 'اصنع': 'craft', 'تصنيع': 'craft',
            'سفر': 'travel', 'انتقل': 'travel', 'تنقل': 'travel',
            'ذهب': 'earn_gold', 'غولد': 'earn_gold', 'كسب_ذهب': 'earn_gold',
            'نشاط': 'use_stamina', 'استهلاك_نشاط': 'use_stamina',
            'دعوة': 'referral', 'إحالة': 'referral', 'احالة': 'referral',
            'سلسلة': 'streak'
        };

        const lower = input.toLowerCase().trim();
        return typeMap[lower] || lower;
    }

    _getTypeNameArabic(type) {
        const names = {
            'gather': 'جمع', 'kill': 'قتل', 'craft': 'صناعة',
            'travel': 'سفر', 'earn_gold': 'كسب ذهب', 'use_stamina': 'استهلاك نشاط',
            'referral': 'إحالة', 'streak': 'سلسلة'
        };
        return names[type] || type;
    }

    _drawProgressBar(current, max, length = 10) {
        const percentage = max > 0 ? current / max : 0;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        const filledBar = '█'.repeat(filled);
        const emptyBar = '░'.repeat(empty);
        const color = percentage >= 1 ? '🟢' : percentage > 0.5 ? '🟢' : percentage > 0.2 ? '🟡' : '🔴';
        return `${color} ${filledBar}${emptyBar}`;
    }

    async _selectDailyTasks(player) {
        const today = new Date().toDateString();
        const taskDate = player.dailyTaskDate || '';

        if (taskDate === today && player.dailyTasksList && player.dailyTasksList.length > 0) {
            return;
        }

        const customTasks = await CustomTask.find({ isDaily: true });

        const allPool = [...this.dailyTaskPool, ...customTasks.map(t => ({
            id: t.id, name: t.name, type: t.type, target: t.target, reward: t.reward
        }))];

        const shuffled = [...allPool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 4);

        player.dailyTaskDate = today;
        player.dailyTasksList = selected;
        player.dailyTaskProgress = {};
        player.completedDailyTasks = [];
        await player.save();
    }

    async showDailyTasks(player) {
        await this._selectDailyTasks(player);
        return this._formatDailyTasks(player);
    }

    _formatDailyTasks(player) {
        const tasks = player.dailyTasksList || [];

        if (tasks.length === 0) {
            return `📋 المهام اليومية\n\n❌ لا توجد مهام حالياً.`;
        }

        let msg = `📋 المهام اليومية\n`;
        let allCompleted = true;

        tasks.forEach(task => {
            const progress = this._getTaskProgress(player, task.id);
            const isCompleted = progress >= task.target;
            if (!isCompleted) allCompleted = false;

            const icon = isCompleted ? '✅' : '⏳';
            const bar = this._drawProgressBar(progress, task.target, 10);

            msg += `\n${icon} ${task.name}\n`;
            msg += `   ${bar}  ${Math.min(progress, task.target)}/${task.target}\n`;
            msg += `   💰 المكافأة: ${task.reward} ذهب\n`;
        });

        if (allCompleted) {
            msg += `\n🎉 أكملت جميع المهام اليومية!\nعد غداً لمهام جديدة.`;
        }

        return msg;
    }

    _getTaskProgress(player, taskId) {
        const progress = player.dailyTaskProgress || {};
        if (progress instanceof Map) return progress.get(taskId) || 0;
        return progress[taskId] || 0;
    }

    async updateTaskProgress(player, type, amount = 1) {
        const tasks = player.dailyTasksList || [];
        if (tasks.length === 0) return;

        let taskProgress = player.dailyTaskProgress || {};
        if (taskProgress instanceof Map) {
            taskProgress = Object.fromEntries(taskProgress);
        }

        let updated = false;

        tasks.forEach(task => {
            if (task.type === type) {
                if (type === 'referral') {
                    taskProgress[task.id] = player.referralCount || 0;
                    updated = true;
                } else if (type === 'streak') {
                    taskProgress[task.id] = player.dailyStreak || 0;
                    updated = true;
                } else {
                    const current = taskProgress[task.id] || 0;
                    if (current < task.target) {
                        taskProgress[task.id] = Math.min(task.target, current + amount);
                        updated = true;
                    }
                }
            }
        });

        if (updated) {
            player.dailyTaskProgress = taskProgress;
            await this._checkTaskCompletion(player);
            await player.save();
        }
    }

    async _checkTaskCompletion(player) {
        let taskProgress = player.dailyTaskProgress || {};
        if (taskProgress instanceof Map) {
            taskProgress = Object.fromEntries(taskProgress);
        }

        const completedTasks = player.completedDailyTasks || [];
        const tasks = player.dailyTasksList || [];

        for (const task of tasks) {
            if (taskProgress[task.id] >= task.target && !completedTasks.includes(task.id)) {
                completedTasks.push(task.id);
                player.addGold(task.reward);
            }
        }

        player.completedDailyTasks = completedTasks;
    }

    async checkAchievements(player) {
        const unlocked = player.unlockedAchievements || [];
        let newAchievements = [];

        for (const achievement of this.achievements) {
            if (unlocked.includes(achievement.id)) continue;

            let isUnlocked = false;
            switch (achievement.type) {
                case 'kill':
                    isUnlocked = (player.stats?.monstersKilled || 0) >= achievement.target;
                    break;
                case 'gather':
                    isUnlocked = (player.stats?.resourcesGathered || 0) >= achievement.target;
                    break;
                case 'craft':
                    isUnlocked = (player.stats?.itemsCrafted || 0) >= achievement.target;
                    break;
                case 'level':
                    isUnlocked = player.level >= achievement.target;
                    break;
                case 'gold':
                    isUnlocked = player.gold >= achievement.target;
                    break;
                case 'referral':
                    isUnlocked = (player.referralCount || 0) >= achievement.target;
                    break;
                case 'streak':
                    isUnlocked = (player.dailyStreak || 0) >= achievement.target;
                    break;
            }

            if (isUnlocked) {
                unlocked.push(achievement.id);
                player.addGold(achievement.reward);
                newAchievements.push(achievement);
            }
        }

        if (newAchievements.length > 0) {
            player.unlockedAchievements = unlocked;
            await player.save();
        }

        return newAchievements;
    }

    async showAchievements(player) {
        const unlocked = player.unlockedAchievements || [];

        let msg = `🏆 الإنجازات (${unlocked.length}/${this.achievements.length})\n`;

        this.achievements.forEach(achievement => {
            const isUnlocked = unlocked.includes(achievement.id);

            let current = 0;
            switch (achievement.type) {
                case 'kill': current = player.stats?.monstersKilled || 0; break;
                case 'gather': current = player.stats?.resourcesGathered || 0; break;
                case 'craft': current = player.stats?.itemsCrafted || 0; break;
                case 'level': current = player.level; break;
                case 'gold': current = player.gold; break;
                case 'referral': current = player.referralCount || 0; break;
                case 'streak': current = player.dailyStreak || 0; break;
            }

            const progress = Math.min(current, achievement.target);
            const bar = this._drawProgressBar(progress, achievement.target, 10);

            if (isUnlocked) {
                msg += `\n✅ ${achievement.name}\n`;
                msg += `   ${achievement.description}\n`;
                msg += `   🎁 تم الحصول على ${achievement.reward} ذهب\n`;
            } else {
                msg += `\n🔒 ${achievement.name}\n`;
                msg += `   ${achievement.description}\n`;
                msg += `   ${bar}  ${progress}/${achievement.target}\n`;
                msg += `   💰 المكافأة: ${achievement.reward} ذهب\n`;
            }
        });

        return msg;
    }

    async addCustomTask(name, type, target, reward, isDaily = true) {
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const task = new CustomTask({ id, name, type, target, reward, isDaily });
        await task.save();
        return task;
    }

    async removeCustomTask(taskId) {
        const result = await CustomTask.deleteOne({ id: taskId });
        return result.deletedCount > 0;
    }

    async listCustomTasks() {
        return await CustomTask.find({});
    }
        }
