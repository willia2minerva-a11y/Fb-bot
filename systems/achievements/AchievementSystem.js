// systems/achievements/AchievementSystem.js
import Player from '../../core/Player.js';

export class AchievementSystem {
    constructor() {
        this.dailyTasks = [
            { id: 'gather_5', name: 'اجمع 5 موارد', type: 'gather', target: 5, reward: 50 },
            { id: 'kill_3', name: 'اقتل 3 وحوش', type: 'kill', target: 3, reward: 100 },
            { id: 'craft_2', name: 'اصنع عنصرين', type: 'craft', target: 2, reward: 75 },
            { id: 'travel_1', name: 'سافر إلى مكان جديد', type: 'travel', target: 1, reward: 25 },
        ];

        this.achievements = [
            { id: 'first_kill', name: 'أول قتيل', description: 'اقتل أول وحش', type: 'kill', target: 1, reward: 100 },
            { id: 'kill_10', name: 'صياد الوحوش', description: 'اقتل 10 وحوش', type: 'kill', target: 10, reward: 500 },
            { id: 'kill_100', name: 'مبيد الوحوش', description: 'اقتل 100 وحش', type: 'kill', target: 100, reward: 5000 },
            { id: 'gather_50', name: 'جامع الموارد', description: 'اجمع 50 مورد', type: 'gather', target: 50, reward: 300 },
            { id: 'craft_10', name: 'الصانع الماهر', description: 'اصنع 10 عناصر', type: 'craft', target: 10, reward: 400 },
            { id: 'level_10', name: 'مغامر مبتدئ', description: 'وصل للمستوى 10', type: 'level', target: 10, reward: 200 },
            { id: 'level_50', name: 'مغامر محترف', description: 'وصل للمستوى 50', type: 'level', target: 50, reward: 2000 },
            { id: 'level_100', name: 'أسطورة', description: 'وصل للمستوى 100', type: 'level', target: 100, reward: 10000 },
            { id: 'gold_1000', name: 'ثري', description: 'اجمع 1000 ذهب', type: 'gold', target: 1000, reward: 500 },
        ];

        console.log('🏆 نظام الإنجازات والمهام تم تهيئته');
    }

    // ✅ عرض المهام اليومية
    async showDailyTasks(player) {
        const tasks = player.dailyTasks || [];
        const today = new Date().toDateString();
        const taskDate = player.dailyTaskDate || '';

        // إذا كان يوم جديد، أعد تعيين المهام
        if (taskDate !== today) {
            player.dailyTasks = [];
            player.dailyTaskDate = today;
            await player.save();
            return this._formatDailyTasks(player);
        }

        return this._formatDailyTasks(player);
    }

    _formatDailyTasks(player) {
        let msg = `📋 المهام اليومية\n\n`;
        let allCompleted = true;

        this.dailyTasks.forEach(task => {
            const progress = this._getTaskProgress(player, task.id);
            const isCompleted = progress >= task.target;
            if (!isCompleted) allCompleted = false;

            const icon = isCompleted ? '✅' : '⏳';
            msg += `${icon} ${task.name}\n`;
            msg += `   التقدم: ${Math.min(progress, task.target)}/${task.target}\n`;
            msg += `   المكافأة: ${task.reward} ذهب\n\n`;
        });

        if (allCompleted) {
            msg += `🎉 أكملت جميع المهام اليومية!\n`;
        }

        return msg;
    }

    _getTaskProgress(player, taskId) {
        const progress = player.dailyTaskProgress || {};
        return progress[taskId] || 0;
    }

    // ✅ تحديث تقدم المهام
    async updateTaskProgress(player, type, amount = 1) {
        const taskProgress = player.dailyTaskProgress || {};
        let updated = false;

        this.dailyTasks.forEach(task => {
            if (task.type === type) {
                const current = taskProgress[task.id] || 0;
                if (current < task.target) {
                    taskProgress[task.id] = Math.min(task.target, current + amount);
                    updated = true;
                }
            }
        });

        if (updated) {
            player.dailyTaskProgress = taskProgress;
            await this._checkTaskCompletion(player);
        }
    }

    async _checkTaskCompletion(player) {
        const taskProgress = player.dailyTaskProgress || {};
        const completedTasks = player.completedDailyTasks || [];

        for (const task of this.dailyTasks) {
            if (taskProgress[task.id] >= task.target && !completedTasks.includes(task.id)) {
                completedTasks.push(task.id);
                player.addGold(task.reward);
            }
        }

        player.completedDailyTasks = completedTasks;
    }

    // ✅ فحص الإنجازات
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

    // ✅ عرض الإنجازات
    async showAchievements(player) {
        const unlocked = player.unlockedAchievements || [];

        let msg = `🏆 الإنجازات (${unlocked.length}/${this.achievements.length})\n\n`;

        this.achievements.forEach(achievement => {
            const isUnlocked = unlocked.includes(achievement.id);
            const icon = isUnlocked ? '✅' : '🔒';
            msg += `${icon} ${achievement.name}\n`;
            msg += `   ${achievement.description}\n`;
            msg += `   المكافأة: ${achievement.reward} ذهب\n\n`;
        });

        return msg;
    }
}
