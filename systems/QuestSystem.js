import { quests } from '../../data/quests.js';

export class QuestSystem {
  constructor(player) {
    this.player = player;
  }

  listCurrentQuests() {
    return this.player.quests;
  }

  completeQuest(questId) {
    // تحقق من المهمة وأضف المكافآت
    console.log('تم إكمال المهمة!');
  }
}