// systems/gathering/GatheringSystem.js
export class GatheringSystem {
  constructor() {
    console.log('🌿 نظام جمع الموارد تم تهيئته');
  }

  gatherResources(player, location) {
    // بيانات مؤقتة لجمع الموارد
    const resources = {
      'forest': [
        { id: 'wood', name: 'خشب', min: 1, max: 3 },
        { id: 'herb', name: 'عشب طبي', min: 1, max: 2 }
      ],
      'village': [
        { id: 'stone', name: 'حجر', min: 1, max: 2 }
      ]
    };

    const locationResources = resources[location] || resources['forest'];
    const randomResource = locationResources[Math.floor(Math.random() * locationResources.length)];
    const quantity = Math.floor(Math.random() * (randomResource.max - randomResource.min + 1)) + randomResource.min;
    
    // إضافة الموارد للاعب
    player.addItem(randomResource.id, randomResource.name, 'resource', quantity);
    player.addGold(5);
    player.addExperience(10);

    return {
      success: true,
      message: `🌿 **جمعت الموارد في ${location}!**\n\n✅ ${quantity} × ${randomResource.name}\n💰 +5 غولد\n✨ +10 خبرة`
    };
  }
}
