// systems/battle/BattleSystem.js
import { monsters } from '../../data/monsters.js';
import { locations } from '../../data/locations.js';
import { items } from '../../data/items.js';

export class BattleSystem {
    constructor() {
        console.log('⚔️ نظام المعارك تم تهيئته');
        this.activeBattles = new Map();
        this.allMonsters = monsters || {};
        this.allLocations = locations || {};
        this.items = items || {};
        this.commandHandler = null; // ✅ سيتم تعيينه لاحقاً
    }

    setCommandHandler(handler) {
        this.commandHandler = handler;
    }

    _drawHealthBar(current, max, length = 10) {
        const percentage = max > 0 ? current / max : 0;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        const filledBar = '█'.repeat(filled);
        const emptyBar = '░'.repeat(empty);
        const color = percentage > 0.5 ? '🟢' : percentage > 0.2 ? '🟡' : '🔴';
        return `${color} ${filledBar}${emptyBar}`;
    }

    _createMonstersDisplay(monsters) {
        const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

        let display = `👹 الأعداء أمامك: ${monsters.length}\n`;

        monsters.forEach((monster, index) => {
            const number = circledNumbers[index] || `(${index + 1})`;
            const icon = monster.isBoss ? '👑' : '👹';
            const healthBar = this._drawHealthBar(monster.health, monster.maxHealth, 10);
            display += `\n${number} ${icon} ${monster.name}\n`;
            display += `   Lv.${monster.level}  ${healthBar}  ${Math.floor(monster.health)}/${monster.maxHealth} HP\n`;
        });

        return display;
    }

    _selectMonstersForBattle(player) {
        const locationId = player.currentLocation || 'forest';
        const locationInfo = this.allLocations[locationId];
        const playerLevel = player.level || 1;

        if (!locationInfo || !locationInfo.monsters || locationInfo.monsters.length === 0) return null;

        const availableMonsterIds = locationInfo.monsters.filter(id => this.allMonsters[id]);
        if (availableMonsterIds.length === 0) return null;

        const suitableMonsters = availableMonsterIds
            .map(id => this.allMonsters[id])
            .filter(monster => {
                const levelDiff = Math.abs(monster.level - playerLevel);
                return levelDiff <= 10 || monster.level <= playerLevel;
            })
            .sort((a, b) => a.level - b.level);

        if (suitableMonsters.length === 0) return null;

        let monsterCount = 1;
        if (playerLevel >= 20) monsterCount = Math.min(1 + Math.floor(playerLevel / 20), 4);

        const selectedMonsters = [];
        for (let i = 0; i < monsterCount; i++) {
            const weightedMonsters = [];
            suitableMonsters.forEach(monster => {
                const weight = monster.level <= playerLevel ? 3 : 1;
                for (let j = 0; j < weight; j++) weightedMonsters.push(monster);
            });

            const randomMonster = weightedMonsters[Math.floor(Math.random() * weightedMonsters.length)];
            if (randomMonster) {
                selectedMonsters.push({ ...randomMonster, health: randomMonster.maxHealth, isBoss: randomMonster.isBoss || false });
            }
        }

        return selectedMonsters.length > 0 ? selectedMonsters : null;
    }

    async startBattle(player) {
        if (this.activeBattles.has(player.userId)) {
            const activeBattle = this.activeBattles.get(player.userId);
            return { error: `⚔️ أنت بالفعل في معركة!\n\n${this._createMonstersDisplay(activeBattle.monsters)}` };
        }

        const staminaCost = 5;
        if (!player.useStamina(staminaCost)) {
            const actualStamina = player.getActualStamina();
            return { error: `😩 تحتاج ${staminaCost} نشاط، لديك ${Math.floor(actualStamina)} فقط.` };
        }

        const monsters = this._selectMonstersForBattle(player);
        if (!monsters) {
            player.stamina = Math.min(player.stamina + staminaCost, player.maxStamina);
            return { error: '❌ لا توجد وحوش مناسبة لمستواك هنا.' };
        }

        const battleData = { monsters, currentTarget: 0, turn: 0 };
        this.activeBattles.set(player.userId, battleData);
        player.setCooldown('battle', 5);
        await player.save();

        return { success: true, message: `⚔️ ━━━ معركة جديدة ━━━ ⚔️\n\n${this._createMonstersDisplay(monsters)}\n\n⚔️ هجوم  •  🏃 هروب` };
    }

    _getCurrentMonster(battleData) { return battleData.monsters[battleData.currentTarget]; }
    _nextMonster(battleData) { battleData.currentTarget++; return battleData.currentTarget < battleData.monsters.length; }

    async attack(player) {
        const battleData = this.activeBattles.get(player.userId);
        if (!battleData) return { error: '❌ لست في معركة. استخدم "قتال" للبدء.' };

        const currentMonster = this._getCurrentMonster(battleData);
        battleData.turn++;

        const playerDamage = player.getAttackDamage(this.items);
        currentMonster.health = Math.max(0, currentMonster.health - playerDamage);

        let battleLog = `💥 هاجمت ${currentMonster.name}\n   ألحقت ${playerDamage} ضرر\n`;

        if (currentMonster.health === 0) {
            battleLog += `\n🎯 تم القضاء على ${currentMonster.name}!\n`;

            if (!this._nextMonster(battleData)) {
                this.activeBattles.delete(player.userId);
                return await this._handleVictory(player, battleData.monsters, battleLog);
            }

            const nextMonster = this._getCurrentMonster(battleData);
            battleLog += `🎯 الآن تواجه ${nextMonster.name}!\n`;
        }

        const aliveMonsters = battleData.monsters.filter((m, index) => m.health > 0 && index >= battleData.currentTarget);
        const totalMonsterDamage = aliveMonsters.reduce((sum, m) => sum + m.damage, 0);

        const isAlive = player.takeDamage(totalMonsterDamage);
        battleLog += `\n💔 الوحوش تهاجمك وتصيبك بـ ${totalMonsterDamage} ضرر\n`;

        if (!isAlive) {
            this.activeBattles.delete(player.userId);
            return await this._handleDefeat(player, battleData.monsters, battleLog);
        }

        const aliveDisplay = battleData.monsters.filter(m => m.health > 0);
        const playerBar = this._drawHealthBar(player.health, player.maxHealth, 10);

        await player.save();

        return { success: true, message: `⚔️ ━━━ المعركة مستمرة ━━━ ⚔️\nدورة ${battleData.turn}\n\n${battleLog}\n\n${this._createMonstersDisplay(aliveDisplay)}\n\n❤️ أنت: ${playerBar}  ${Math.floor(player.health)}/${player.maxHealth} HP\n\n⚔️ هجوم  •  🏃 هروب` };
    }

    async escape(player) {
        const battleData = this.activeBattles.get(player.userId);
        if (!battleData) return { error: '❌ لست في معركة حالياً.' };

        const escapeStaminaCost = 10;
        if (!player.useStamina(escapeStaminaCost)) {
            const actualStamina = player.getActualStamina();
            return { error: `😩 تحتاج ${escapeStaminaCost} نشاط للهروب، لديك ${Math.floor(actualStamina)}.` };
        }

        const monsterCount = battleData.monsters.length;
        const escapeChance = 0.6 / monsterCount;

        if (Math.random() < escapeChance) {
            this.activeBattles.delete(player.userId);
            await player.save();
            return { success: true, message: `🏃 هربت بنجاح!\n(-${escapeStaminaCost} نشاط)` };
        }

        const aliveMonsters = battleData.monsters.filter(m => m.health > 0);
        const totalMonsterDamage = aliveMonsters.reduce((sum, m) => sum + m.damage, 0);

        const isAlive = player.takeDamage(totalMonsterDamage);

        if (!isAlive) {
            this.activeBattles.delete(player.userId);
            return await this._handleDefeat(player, battleData.monsters, `❌ فشل الهروب!\n💔 الوحوش تهاجمك وتصيبك بـ ${totalMonsterDamage} ضرر.`);
        }

        const playerBar = this._drawHealthBar(player.health, player.maxHealth, 10);
        await player.save();

        return { success: false, message: `❌ فشل الهروب!\n💔 أصبت بـ ${totalMonsterDamage} ضرر (-${escapeStaminaCost} نشاط)\n\n❤️ أنت: ${playerBar}  ${Math.floor(player.health)}/${player.maxHealth} HP\n\n⚔️ هجوم  •  🏃 هروب` };
    }

    async _handleVictory(player, monsters, log) {
        let totalExp = 0;
        let totalGold = 0;
        const drops = [];
        const defeatedNames = [];

        monsters.forEach(monster => {
            totalExp += monster.exp || 0;
            totalGold += monster.gold || 0;
            defeatedNames.push(monster.name);

            if (monster.drops && monster.drops.length > 0) {
                for (const drop of monster.drops) {
                    if (Math.random() < drop.chance) {
                        const quantity = drop.min ? Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min : 1;
                        const dropInfo = this.items[drop.itemId] || { name: drop.itemId };
                        player.addItem(drop.itemId, dropInfo.name, dropInfo.type || 'drop', quantity);
                        drops.push({ name: dropInfo.name, quantity });
                    }
                }
            }
        });

        player.addGold(totalGold);
        player.addExperience(totalExp);

        if (player.stats) {
            player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
            player.stats.monstersKilled = (player.stats.monstersKilled || 0) + monsters.length;
        }

        // ✅ تحديث المهام والإنجازات
        try {
            const achievementSystem = await this.commandHandler?.getSystem('achievement');
            if (achievementSystem) {
                await achievementSystem.updateTaskProgress(player, 'kill', monsters.length);
                await achievementSystem.checkAchievements(player);
            }
        } catch (error) {
            console.error('❌ خطأ في تحديث الإنجازات:', error);
        }

        let dropsMsg = '';
        if (drops.length > 0) dropsMsg = '\n\n🎁 الغنائم:\n' + drops.map(d => `• ${d.quantity} × ${d.name}`).join('\n');

        await player.save();

        return { success: true, type: 'victory', message: `${log}\n\n🎉 ━━━ انتصار! ━━━ 🎉\n\n👹 الوحوش المهزومة: ${defeatedNames.join('، ')}\n💰 الذهب: +${totalGold}\n✨ الخبرة: +${totalExp}${dropsMsg}` };
    }

    async _handleDefeat(player, monsters, log) {
        const goldLost = player.respawn();

        if (player.stats) player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;

        await player.save();

        const locationName = this.allLocations['village']?.name || 'القرية';

        return { success: false, type: 'defeat', message: `${log}\n\n💀 ━━━ هُزمت ━━━ 💀\n\n💰 خسرت: ${goldLost} ذهب\n📍 تم نقلك إلى ${locationName}\n❤️ صحتك: ${Math.floor(player.health)}/${player.maxHealth} HP` };
    }
}
