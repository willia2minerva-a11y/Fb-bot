import { resources } from '../../data/resources.js';

export class GatheringSystem {
  constructor() {
    this.resources = resources;
    this.lastGatherTimes = new Map();
  }

  canGather(player) {
    const lastGather = this.lastGatherTimes.get(player.userId);
    const cooldown = 2 * 60 * 1000; // 2 دقيقة

    if (lastGather && (Date.now() - lastGather < cooldown)) {
      const remaining = Math.ceil((cooldown - (Date.now() - lastGather)) / 1000 / 60);
      return { can: false, remaining };
    }

    return { can: true, remaining: 0 };
  }

  gatherResources(player, location) {
    const canGather = this.canGather(player);
    if (!canGather.can) {
      return { error: `⏳ **يجب الانتظار ${canGather.remaining} دقيقة** قبل التجميع مرة أخرى.` };
    }

    const locationResources = this.resources.filter(res => 
      res.regions.includes(location) || 
      res.regions.includes('جميع المناطق')
    );

    if (locationResources.length === 0) {
      return { error: "❌ لا توجد موارد متاحة في هذا المكان." };
    }

    const resource = locationResources[Math.floor(Math.random() * locationResources.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const goldEarned = this.calculateGoldValue(resource.rarity) * quantity;

    // تحديث اللاعب
    player.addItem(`res_${Date.now()}`, resource.name, 'resource', quantity);
    player.addGold(goldEarned);
    player.stats.resourcesCollected += quantity;
    
    const leveledUp = player.addExp(this.calculateExp(resource.rarity) * quantity);
    this.lastGatherTimes.set(player.userId, Date.now());

    let response = `🌿 **جمعت الموارد!**\n\n`;
    response += `✅ ${quantity} × ${resource.name}\n`;
    response += `💰 +${goldEarned} غولد\n`;
    response += `⭐ +${this.calculateExp(resource.rarity) * quantity} خبرة\n`;
    response += `📊 الندرة: ${this.getRarityText(resource.rarity)}\n`;

    if (leveledUp.leveledUp) {
      response += `\n🎉 **تهانينا! صعدت للمستوى ${leveledUp.newLevel}!**`;
    }

    return {
      success: true,
      message: response,
      resources: { name: resource.name, quantity, gold: goldEarned },
      leveledUp: leveledUp.leveledUp
    };
  }

  calculateGoldValue(rarity) {
    const values = {
      'سهل': 5,
      'متوسط': 8,
      'صعب': 15,
      'نادر جدًا': 25
    };
    return values[rarity] || 5;
  }

  calculateExp(rarity) {
    const values = {
      'سهل': 10,
      'متوسط': 15,
      'صعب': 25,
      'نادر جدًا': 40
    };
    return values[rarity] || 10;
  }

  getRarityText(rarity) {
    const texts = {
      'سهل': '🟢 عادي',
      'متوسط': '🔵 متوسطة',
      'صعب': '🟣 نادرة',
      'نادر جدًا': '🟠 أسطورية'
    };
    return texts[rarity] || '🟢 عادي';
  }
                                                      }
