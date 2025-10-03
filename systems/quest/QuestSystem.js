import { quests } from '../../data/quests.js';

export class QuestSystem {
  constructor() {
    this.quests = quests;
    this.activeQuests = new Map();
  }

  getAvailableQuests(player) {
    return this.quests.filter(quest => 
      quest.requirements.level <= player.level &&
      !player.quests.some(q => q.questId === quest.id && !q.completed) &&
      (!quest.requirements.quest || player.quests.some(q => q.questId === quest.requirements.quest && q.completed))
    );
  }

  startQuest(player, questId) {
    const quest = this.quests.find(q => q.id === questId);
    
    if (!quest) {
      return { error: "❌ هذه المهمة غير موجودة." };
    }

    if (quest.requirements.level > player.level) {
      return { error: `❌ تحتاج إلى المستوى ${quest.requirements.level} لبدء هذه المهمة.` };
    }

    // التحقق إذا كانت المهمة نشطة بالفعل
    if (player.quests.some(q => q.questId === questId && !q.completed)) {
      return { error: "❌ هذه المهمة نشطة بالفعل." };
    }

    // إضافة المهمة للاعب
    player.quests.push({
      questId: quest.id,
      title: quest.title,
      description: quest.description,
      objectives: quest.objectives.map(obj => ({ ...obj, current: 0 })),
      progress: 0,
      completed: false,
      startedAt: new Date()
    });

    this.activeQuests.set(`${player.userId}_${questId}`, {
      playerId: player.userId,
      questId: questId,
      startTime: new Date()
    });

    return {
      success: true,
      message: `📜 **بدأت مهمة جديدة: ${quest.title}**\n\n${quest.description}\n\n🎯 **الأهداف:**\n${this.formatObjectives(quest.objectives)}\n\n⏰ **المكافآت:**\n${this.formatRewards(quest.rewards)}`,
      quest: quest
    };
  }

  updateQuestProgress(player, objectiveType, amount = 1) {
    const updatedQuests = [];
    
    player.quests.forEach(questData => {
      if (questData.completed) return;

      const quest = this.quests.find(q => q.id === questData.questId);
      if (!quest) return;

      let updated = false;
      
      questData.objectives.forEach(obj => {
        if (obj.type === objectiveType && obj.current < obj.target) {
          obj.current = Math.min(obj.current + amount, obj.target);
          updated = true;
        }
      });

      if (updated) {
        // تحديث التقدم العام
        const totalObjectives = questData.objectives.length;
        const completedObjectives = questData.objectives.filter(obj => obj.current >= obj.target).length;
        questData.progress = Math.floor((completedObjectives / totalObjectives) * 100);

        // التحقق من إكمال المهمة
        if (completedObjectives === totalObjectives) {
          this.completeQuest(player, questData, quest);
        }

        updatedQuests.push(questData);
      }
    });

    return updatedQuests;
  }

  completeQuest(player, questData, quest) {
    questData.completed = true;
    questData.completedAt = new Date();

    // منح المكافآت
    if (quest.rewards.exp) {
      player.addExp(quest.rewards.exp);
    }
    
    if (quest.rewards.gold) {
      player.addGold(quest.rewards.gold);
    }
    
    if (quest.rewards.items) {
      quest.rewards.items.forEach(item => {
        player.addItem(`quest_${quest.id}_${item}`, item, 'quest_reward', 1);
      });
    }

    player.stats.questsCompleted += 1;

    // إزالة من المهام النشطة
    this.activeQuests.delete(`${player.userId}_${questData.questId}`);
  }

  getActiveQuests(player) {
    const activeQuests = player.quests.filter(q => !q.completed);
    
    if (activeQuests.length === 0) {
      const availableQuests = this.getAvailableQuests(player);
      
      if (availableQuests.length === 0) {
        return { 
          message: "📜 **لا توجد مهام متاحة حالياً**\n\nتابع تقدمك في اللعبة لفتح مهام جديدة!",
          quests: [] 
        };
      }

      let availableText = `📜 **المهام المتاحة**\n\n`;
      availableQuests.forEach((quest, index) => {
        availableText += `${index + 1}. **${quest.title}**\n`;
        availableText += `   📝 ${quest.description}\n`;
        availableText += `   🎯 المستوى المطلوب: ${quest.requirements.level}\n`;
        availableText += `   💰 المكافآت: ${this.formatRewardsShort(quest.rewards)}\n\n`;
      });

      availableText += `استخدم \`بدء مهمة [رقم المهمة]\` لبدء مهمة.`;

      return {
        message: availableText,
        quests: availableQuests,
        type: 'available'
      };
    }

    let activeText = `📜 **المهام النشطة لـ${player.name}**\n\n`;
    
    activeQuests.forEach((questData, index) => {
      const quest = this.quests.find(q => q.id === questData.questId);
      activeText += `${index + 1}. **${questData.title}**\n`;
      activeText += `   📊 التقدم: ${questData.progress}%\n`;
      
      questData.objectives.forEach(obj => {
        const completion = obj.current >= obj.target ? '✅' : '⏳';
        activeText += `   ${completion} ${this.getObjectiveText(obj)} (${obj.current}/${obj.target})\n`;
      });
      
      activeText += `   🎁 المكافآت: ${this.formatRewardsShort(quest.rewards)}\n\n`;
    });

    return {
      message: activeText,
      quests: activeQuests,
      type: 'active'
    };
  }

  formatObjectives(objectives) {
    return objectives.map(obj => {
      const text = this.getObjectiveText(obj);
      return `• ${text} (${obj.target})`;
    }).join('\n');
  }

  getObjectiveText(objective) {
    const texts = {
      'kill_monsters': 'هزم وحوش',
      'gather_resources': 'اجمع موارد',
      'collect_items': 'اجمع أغراض',
      'reach_level': 'صل إلى المستوى',
      'visit_location': 'زر مكان'
    };
    return texts[objective.type] || objective.type;
  }

  formatRewards(rewards) {
    let text = '';
    if (rewards.exp) text += `• ⭐ ${rewards.exp} خبرة\n`;
    if (rewards.gold) text += `• 💰 ${rewards.gold} غولد\n`;
    if (rewards.items) {
      rewards.items.forEach(item => text += `• 🎁 ${item}\n`);
    }
    return text;
  }

  formatRewardsShort(rewards) {
    const parts = [];
    if (rewards.exp) parts.push(`⭐ ${rewards.exp}`);
    if (rewards.gold) parts.push(`💰 ${rewards.gold}`);
    if (rewards.items) parts.push(`🎁 ${rewards.items.length} غرض`);
    return parts.join(' | ');
  }

  handleQuestCommand(player, message) {
    const parts = message.split(' ');
    const action = parts[1]; // بدء، التخلي، etc.
    const questIdentifier = parts.slice(2).join(' ');

    switch (action) {
      case 'بدء':
        return this.startQuest(player, questIdentifier);
      case 'التخلي':
        return this.abandonQuest(player, questIdentifier);
      default:
        return this.getActiveQuests(player);
    }
  }

  abandonQuest(player, questId) {
    const questIndex = player.quests.findIndex(q => q.questId === questId && !q.completed);
    
    if (questIndex === -1) {
      return { error: "❌ لم تجد مهمة نشطة بهذا الاسم." };
    }

    player.quests.splice(questIndex, 1);
    this.activeQuests.delete(`${player.userId}_questId`);

    return {
      success: true,
      message: "🗑️ **تخلّيت عن المهمة.**\n\nيمكنك البدء بها مرة أخرى لاحقاً."
    };
  }
            }
