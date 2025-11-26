// systems/battle/BattleSystem.js

import { monsters } from '../../data/monsters.js';
import { locations } from '../../data/locations.js';
import { items } from '../../data/items.js';

export class BattleSystem {

    constructor() {
        console.log('⚔️ نظام المعارك تم تهيئته');  
        this.activeBattles = new Map();  
        this.allMonsters = monsters;  
        this.allLocations = locations;  
        this.items = items;
    }

    // 🆕 دالة مساعدة لرسم شريط الصحة
    _drawHealthBar(current, max, length = 15, label = 'HP') {
        const percentage = max > 0 ? current / max : 0;  
        const filled = Math.round(length * percentage);  
        const empty = length - filled;  
          
        const filledBar = '█'.repeat(filled);  
        const emptyBar = '░'.repeat(empty);  
        const color = percentage > 0.5 ? '🟢' : percentage > 0.2 ? '🟡' : '🔴';  
          
        return `${label}: ${color}[${filledBar}${emptyBar}] (${current}/${max})`;
    }

    // 🆕 دالة محسنة لاختيار الوحوش بناءً على مستوى اللاعب والموقع
    _selectMonstersForBattle(player) {
        const locationId = player.currentLocation || 'forest';
        const locationInfo = this.allLocations[locationId];
        const playerLevel = player.level || 1;

        if (!locationInfo || !locationInfo.monsters || locationInfo.monsters.length === 0) {
            return null;
        }

        // تصفية الوحوش المتاحة في الموقع
        const availableMonsterIds = locationInfo.monsters.filter(id => this.allMonsters[id]);
        if (availableMonsterIds.length === 0) return null;

        // تصنيف الوحوش حسب المستوى
        const suitableMonsters = availableMonsterIds
            .map(id => this.allMonsters[id])
            .filter(monster => {
                const levelDiff = Math.abs(monster.level - playerLevel);
                // السماح بوحوش بمستوى قريب من مستوى اللاعب
                return levelDiff <= 10 || monster.level <= playerLevel;
            })
            .sort((a, b) => a.level - b.level);

        if (suitableMonsters.length === 0) return null;

        // تحديد عدد الوحوش في المعركة
        let monsterCount = 1;
        if (playerLevel >= 20) {
            // لاعبين مستواهم عالي يواجهون مجموعات
            monsterCount = Math.min(1 + Math.floor(playerLevel / 20), 4);
        }

        // اختيار الوحوش للمعركة
        const selectedMonsters = [];
        for (let i = 0; i < monsterCount; i++) {
            // ترجيح الوحوش المناسبة للمستوى
            const weightedMonsters = [];
            suitableMonsters.forEach(monster => {
                const weight = monster.level <= playerLevel ? 3 : 1;
                for (let j = 0; j < weight; j++) {
                    weightedMonsters.push(monster);
                }
            });

            const randomMonster = weightedMonsters[Math.floor(Math.random() * weightedMonsters.length)];
            if (randomMonster) {
                selectedMonsters.push({
                    ...randomMonster,
                    health: randomMonster.maxHealth,
                    isBoss: randomMonster.isBoss || false
                });
            }
        }

        return selectedMonsters.length > 0 ? selectedMonsters : null;
    }

    // 🆕 دالة لإنشاء رسالة عرض الوحوش
    _createMonstersDisplay(monsters) {
        if (monsters.length === 1) {
            const monster = monsters[0];
            const monsterHPBar = this._drawHealthBar(monster.health, monster.maxHealth, 10, 'وحش');
            return `**${monster.name}** (المستوى ${monster.level})\n${monsterHPBar}`;
        } else {
            let display = `**مجموعة من ${monsters.length} وحوش:**\n`;
            monsters.forEach((monster, index) => {
                const monsterHPBar = this._drawHealthBar(monster.health, monster.maxHealth, 8, `#${index + 1}`);
                display += `\n${index + 1}. ${monster.name} (م ${monster.level})\n${monsterHPBar}`;
            });
            return display;
        }
    }

    // 1. بدء المعركة - محدثة
    async startBattle(player) {
        if (this.activeBattles.has(player.userId)) {  
            const activeBattle = this.activeBattles.get(player.userId);  
            return {  
                error: `⚔️ أنت بالفعل في معركة! ${this._createMonstersDisplay(activeBattle.monsters)}`  
            };  
        }  
        
        const staminaCost = 5;  
        if (!player.useStamina(staminaCost)) {  
             const actualStamina = player.getActualStamina();  
             return { error: `😩 تحتاج ${staminaCost} نشاط لبدء القتال، لديك ${Math.floor(actualStamina)} فقط.` };  
        }  
        
        const monsters = this._selectMonstersForBattle(player);
        if (!monsters) {  
            player.stamina = Math.min(player.stamina + staminaCost, player.maxStamina);  
            return { error: `❌ لا توجد وحوش مناسبة لمستواك في هذا الموقع.` };  
        }  

        const battleData = {
            monsters: monsters,
            currentTarget: 0, // الفهرس الحالي للوحش المستهدف
            turn: 0
        };

        this.activeBattles.set(player.userId, battleData);  
        player.setCooldown('battle', 5);  
        await player.save();  

        const monstersDisplay = this._createMonstersDisplay(monsters);

        return {  
            success: true,  
            monsters: monsters,
            message: `⚔️ **بدأت معركة عنيفة!**\n\n${monstersDisplay}\n\nاستخدم \`هجوم\` للقتال أو \`هروب\` للمحاولة.`  
        };
    }

    // 🆕 دالة مساعدة للحصول على الوحش الحالي المستهدف
    _getCurrentMonster(battleData) {
        return battleData.monsters[battleData.currentTarget];
    }

    // 🆕 دالة مساعدة للانتقال للوحش التالي
    _nextMonster(battleData) {
        battleData.currentTarget++;
        return battleData.currentTarget < battleData.monsters.length;
    }

    // 2. الهجوم - محدثة
    async attack(player) {
        const battleData = this.activeBattles.get(player.userId);  
        if (!battleData) {  
            return { error: '❌ أنت لست في معركة حالياً. استخدم `قتال` لبدء واحدة.' };  
        }  

        const currentMonster = this._getCurrentMonster(battleData);
        battleData.turn++;

        const playerDamage = player.getAttackDamage(this.items);  
        const monsterDamage = currentMonster.damage;  
        
        currentMonster.health = Math.max(0, currentMonster.health - playerDamage);  
        
        let battleLog = `💥 هجمت على **${currentMonster.name}**! ألحقت **${playerDamage}** ضرراً.`;  

        // التحقق إذا تم هزيمة الوحش الحالي
        if (currentMonster.health === 0) {  
            battleLog += `\n🎯 تم القضاء على **${currentMonster.name}**!`;
            
            // الانتقال للوحش التالي أو إنهاء المعركة
            if (!this._nextMonster(battleData)) {
                this.activeBattles.delete(player.userId);  
                return await this._handleVictory(player, battleData.monsters, battleLog);  
            } else {
                const nextMonster = this._getCurrentMonster(battleData);
                battleLog += `\n🎯 الآن تواجه **${nextMonster.name}**!`;
            }
        }

        // هجوم الوحوش الباقية على اللاعب
        let totalMonsterDamage = 0;
        let monstersAttackLog = '';
        
        battleData.monsters.forEach((monster, index) => {
            if (monster.health > 0 && index >= battleData.currentTarget) {
                totalMonsterDamage += monster.damage;
                if (monstersAttackLog) monstersAttackLog += '، ';
                monstersAttackLog += monster.name;
            }
        });

        const isAlive = player.takeDamage(totalMonsterDamage);  
        battleLog += `\n💔 **${monstersAttackLog}** يهاجمونك! أصبت بـ **${totalMonsterDamage}** ضرر.`;  
        
        if (!isAlive) {  
            this.activeBattles.delete(player.userId);  
            return await this._handleDefeat(player, battleData.monsters, battleLog);  
        }  

        // تحديث عرض الصحة
        const monstersDisplay = this._createMonstersDisplay(battleData.monsters.filter(m => m.health > 0));
        const playerHPBar = this._drawHealthBar(player.health, player.maxHealth, 10, 'أنت');

        await player.save();  
        return {  
            success: true,  
            message: `⚔️ **المعركة مستمرة!** (دورة ${battleData.turn})\n\n${battleLog}\n\n${monstersDisplay}\n${playerHPBar}`  
        };
    }

    // 3. محاولة الهروب - محدثة
    async escape(player) {
        const battleData = this.activeBattles.get(player.userId);  
        if (!battleData) {  
            return { error: '❌ أنت لست في معركة حالياً.' };  
        }  

        const escapeStaminaCost = 10;  
        if (!player.useStamina(escapeStaminaCost)) {  
             const actualStamina = player.getActualStamina();  
             return { error: `😩 تحتاج ${escapeStaminaCost} نشاط لمحاولة الهروب! لديك ${Math.floor(actualStamina)} فقط.` };  
        }  

        // فرصة الهروب تعتمد على عدد الوحوش
        const baseEscapeChance = 0.6;
        const monsterCount = battleData.monsters.length;
        const escapeChance = baseEscapeChance / monsterCount;
        
        if (Math.random() < escapeChance) {  
            this.activeBattles.delete(player.userId);  
            await player.save();  
            return {  
                success: true,  
                message: `🏃‍♂️ هربت بنجاح! تركت ${monsterCount} وحوش خلفك. (-${escapeStaminaCost} نشاط)`  
            };  
        } else {  
            let totalMonsterDamage = 0;
            let monstersAttackLog = '';
            
            battleData.monsters.forEach(monster => {
                if (monster.health > 0) {
                    totalMonsterDamage += monster.damage;
                    if (monstersAttackLog) monstersAttackLog += '، ';
                    monstersAttackLog += monster.name;
                }
            });

            const isAlive = player.takeDamage(totalMonsterDamage);  
            
            let message = `❌ فشلت محاولة الهروب! **${monstersAttackLog}** يهاجمونك.\n💔 أصبت بـ **${totalMonsterDamage}** ضرر. (-${escapeStaminaCost} نشاط)`;  

            if (!isAlive) {  
                this.activeBattles.delete(player.userId);  
                return await this._handleDefeat(player, battleData.monsters, message);  
            }  
            
            const playerHPBar = this._drawHealthBar(player.health, player.maxHealth, 10, 'أنت');

            await player.save();  
            return {  
                success: false,  
                message: `${message}\n${playerHPBar}\nحاول الهجوم أو الهروب مرة أخرى!`  
            };  
        }
    }

    // 4. دالة مساعدة للانتصار - محدثة
    async _handleVictory(player, monsters, log) {
        let totalExp = 0;
        let totalGold = 0;
        const drops = [];
        const defeatedMonsters = [];

        monsters.forEach(monster => {
            totalExp += monster.exp;
            totalGold += monster.gold;
            defeatedMonsters.push(monster.name);

            // جمع الغنائم من كل وحش
            if (monster.drops && monster.drops.length > 0) {  
                for (const drop of monster.drops) {  
                    if (Math.random() < drop.chance) {  
                        const quantity = drop.min ? 
                            Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min : 1;
                        const dropItemInfo = this.items[drop.itemId] || { name: drop.itemId, type: 'drop' };   
                        player.addItem(drop.itemId, dropItemInfo.name, dropItemInfo.type, quantity);   
                        drops.push({ name: dropItemInfo.name, quantity });  
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

        let dropsMessage = '\n🎁 الغنائم المكتسبة:';  
        if (drops.length > 0) {  
            drops.forEach(drop => {  
                dropsMessage += `\n   • ${drop.quantity} × ${drop.name}`;   
            });  
        } else {  
            dropsMessage += '\n   • لم تسقط أي عناصر نادرة.';  
        }  

        await player.save();  

        const monstersList = defeatedMonsters.join('، ');

        return {  
            success: true,  
            type: 'victory',  
            message: `${log}\n\n🎉 **انتصار ساحق!** تم القضاء على ${monsters.length} وحوش!\n\n👹 الوحوش المهزومة: ${monstersList}\n💰 ربحت: **${totalGold} غولد**\n✨ خبرة: **+${totalExp}**${dropsMessage}`  
        };
    }

    // 5. دالة مساعدة للخسارة - محدثة
    async _handleDefeat(player, monsters, log) {
        const goldLost = player.respawn();  
        
        if (player.stats) {  
            player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;  
        }  

        await player.save();  
        
        const respawnLocationName = this.allLocations['village']?.name || 'القرية';  
        const monstersList = monsters.map(m => m.name).join('، ');

        return {  
            success: false,  
            type: 'defeat',  
            message: `${log}\n\n💀 **لقد هُزمت!** ${monsters.length} وحوش كانوا أقوى منك.\n\n👹 الوحوش: ${monstersList}\n خسرت **${goldLost} غولد**.\n تم نقلك إلى **${respawnLocationName}** للتعافي.\n صحتك الآن: ${player.health} HP.`  
        };
    }
            }
