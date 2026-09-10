// systems/achievements/AchievementSystem.js
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

    _drawProgressBar(current, max, length = 10) {
        const percentage = max > 0 ? current / max : 0;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        const filledBar = '█'.repeat(filled);
        const emptyBar = '░'.repeat(empty);
        const color = percentage >= 1 ? '🟢' : percentage > 0.5 ? '🟢' : percentage > 0.2 ? '🟡' : '🔴';
        return `${color} ${filledBar}${emptyBar}`;
    }

    async showDailyTasks(player) {
        const today = new Date().toDateString();
        const taskDate = player.dailyTaskDate || '';

        if (taskDate !== today) {
            player.dailyTasks = [];
            player.dailyTaskProgress = {};
            player.completedDailyTasks = [];
            player.dailyTaskDate = today;
            await player.save();
        }

        return this._formatDailyTasks(player);
    }

    _formatDailyTasks(player) {
        let msg = `📋 المهام اليومية\n`;
        let allCompleted = true;

        this.dailyTasks.forEach(task => {
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
            msg += `\n🎉 أكملت جميع المهام اليومية!\n`;
            msg += `عد غداً لمهام جديدة.`;
        }

        return msg;
    }

    _getTaskProgress(player, taskId) {
        const progress = player.dailyTaskProgress || {};
        if (progress instanceof Map) return progress.get(taskId) || 0;
        return progress[taskId] || 0;
    }

    async updateTaskProgress(player, type, amount = 1) {
        let taskProgress = player.dailyTaskProgress || {};
        if (taskProgress instanceof Map) {
            taskProgress = Object.fromEntries(taskProgress);
        }

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
            await player.save();
        }
    }

    async _checkTaskCompletion(player) {
        let taskProgress = player.dailyTaskProgress || {};
        if (taskProgress instanceof Map) {
            taskProgress = Object.fromEntries(taskProgress);
        }

        const completedTasks = player.completedDailyTasks || [];

        for (const task of this.dailyTasks) {
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
}
