// systems/gathering/GatheringSystem.js
import { resources } from '../../data/resources.js';
import { items as ITEMS_DATA } from '../../data/items.js';

export class GatheringSystem {
  constructor() {
    this.allResources = resources;
    this.ITEMS = ITEMS_DATA;
    this.gatheringCooldowns = new Map();
    console.log('🌿 نظام جمع الموارد تم تهيئته. عدد الموارد القابلة للجمع:', Object.keys(this.allResources).length);
  }

  // ✅ دالة ترجمة موحدة
  _translateItemName(itemId) {
    if (this.allResources[itemId]?.name) return this.allResources[itemId].name;
    if (this.ITEMS[itemId]?.name) return this.ITEMS[itemId].name;
    return itemId;
  }

  _getCooldownByRarity(rarity) {
    const cooldowns = {
      'common': 15000,
      'uncommon': 25000,
      'rare': 45000,
      'epic': 90000,
      'legendary': 180000,
      'mythic': 300000
    };
    return cooldowns[rarity] || 15000;
  }

  _formatCooldown(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds} ثانية`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds > 0) {
        return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
      }
      return `${minutes} دقيقة`;
    }
  }

  _isOnCooldown(userId) {
    const cooldownData = this.gatheringCooldowns.get(userId);
    if (!cooldownData) return false;
    return Date.now() < cooldownData.endTime;
  }

  _getRemainingCooldown(userId) {
    const cooldownData = this.gatheringCooldowns.get(userId);
    if (!cooldownData) return 0;
    return Math.max(0, cooldownData.endTime - Date.now());
  }

  _setCooldown(userId, duration) {
    this.gatheringCooldowns.set(userId, {
      startTime: Date.now(),
      endTime: Date.now() + duration,
      duration: duration
    });
  }

  _cleanupCooldowns() {
    const now = Date.now();
    for (const [userId, cooldownData] of this.gatheringCooldowns.entries()) {
      if (now >= cooldownData.endTime) {
        this.gatheringCooldowns.delete(userId);
      }
    }
  }

  _getResourceEmoji(resourceId) {
    const emojiMap = {
      'wood': '🪵', 'stone': '🪨', 'vine': '🌿', 'honey': '🍯',
      'wheat': '🌾', 'clay': '🧱', 'bone': '🦴', 'raw_meat': '🥩',
      'raw_fish': '🐟', 'slime_gel': '🫧', 'spider_web': '🕸️',
      'copper_ore': '🟤', 'copper_bar': '🟤', 'iron_ore': '⚙️',
      'iron_bar': '⚙️', 'silver_ore': '⚪', 'silver_bar': '⚪',
      'gold_ore': '🪙', 'gold_bar': '🪙', 'platinum_ore': '💎',
      'platinum_bar': '💎', 'hellstone': '🔥', 'hellstone_bar': '🔥',
      'demonite_ore': '😈', 'coal': '⚫', 'soul_of_light': '🌟',
      'soul_of_night': '🌙', 'soul_of_might': '💪', 'soul_of_fright': '👻',
      'soul_of_sight': '👁️', 'soul_shard': '💠', 'divine_fragment': '✨',
      'divine_steel': '⚡', 'celestial_fragment': '🌌', 'dark_crystal': '🔮',
      'moon_dust': '🌙', 'solar_fragment': '☀️', 'nebula_fragments': '🌠',
      'wyvern_wings': '🪽', 'harpy_feather': '🪶', 'plantera_bulb': '🌸',
      'lihzahrd_power_cell': '🔋', 'broken_hero_sword': '🗡️',
      'hallowed_bar': '🪙', 'sacred_steel': '⚡', 'gods_essence': '💫',
      'infernal_ring': '🔥', 'dark_abyss_core': '🕳️',
      'abyssal_blade_resource': '🗡️', 'dragon_kings_horn': '🐉',
      'default': '📦'
    };
    return emojiMap[resourceId] || emojiMap['default'];
  }

  _getLocationName(locationId) {
    const locationNames = {
      'forest': 'الغابة', 'desert': 'الصحراء', 'mountain': 'الجبل',
      'cave': 'الكهف', 'plains': 'السهول', 'snow': 'الثلوج',
      'sky': 'السماء', 'ocean': 'المحيط', 'river': 'النهر',
      'hell': 'الجحيم', 'jungle': 'الغابة الاستوائية',
      'underground_jungle': 'الغابة الجوفية', 'jungle_temple': 'معبد الغابة',
      'old_temple': 'المعبد القديم', 'lunar_temple': 'معبد القمر',
      'hallowed': 'الأرض المقدسة', 'forge': 'المسبك',
      'solar_eclipse': 'الكسوف الشمسي', 'hardmode_areas': 'مناطق الهارد مود',
      'caves_hardmode': 'كهوف الهارد مود', 'hardmode_bosses': 'زعماء الهارد مود',
      'divine_dungeon': 'الزنزانة الإلهية', 'final_stage': 'المرحلة النهائية',
      'celestial_gate': 'البوابة السماوية', 'celestial_realm': 'العالم السماوي',
      'abyss_gate': 'بوابة الهاوية', 'ultimate_dungeon': 'الزنزانة النهائية',
      'double_dungeon': 'الزنزانة المزدوجة', 'dark_castle': 'القلعة المظلمة',
      'magic_castle': 'القلعة السحرية', 'rulers_castle': 'قلعة الحاكم',
      'order_castle': 'قلعة النظام', 'heavenly_dungeon': 'الزنزانة السماوية',
      'e_d_gates': 'بوابات E-D', 'b_a_gates': 'بوابات B-A',
      'c_b_gates': 'بوابات C-B', 'a_s_gates': 'بوابات A-S',
      's_rank_gates': 'بوابات S', 'a_gates': 'بوابات A',
      'c_a_gates': 'بوابات C-A', 'a_b_gates': 'بوابات A-B'
    };
    return locationNames[locationId] || locationId;
  }

  showAvailableResources(player) {
    this._cleanupCooldowns();
    
    const playerLocationId = player?.currentLocation || 'forest';
    const locationName = this._getLocationName(playerLocationId);
    
    let message = `🔍 موارد ${locationName}\n`;
    let found = false;

    if (this._isOnCooldown(player.userId)) {
      const remainingTime = this._getRemainingCooldown(player.userId);
      const formattedTime = this._formatCooldown(remainingTime);
      const cooldownData = this.gatheringCooldowns.get(player.userId);
      message += `\n⏳ في فترة انتظار: ${formattedTime}\n`;
      message += `📦 آخر مورد: ${this._translateItemName(cooldownData?.resourceId) || 'غير معروف'}\n`;
    }

    for (const resourceId in this.allResources) {
      const resource = this.allResources[resourceId];
      
      if (!resource || !resource.locations || !Array.isArray(resource.locations)) {
        continue;
      }
      
      if (!resource.items || !resource.gatherTime) {
        continue;
      }
      
      if (resource.locations.includes(playerLocationId)) {
        found = true;
        const cooldownTime = this._getCooldownByRarity(resource.rarity || 'common');
        const formattedCooldown = this._formatCooldown(cooldownTime);
        const emoji = this._getResourceEmoji(resourceId);
        const resourceName = this._translateItemName(resourceId);
        
        message += `\n${emoji} ${resourceName}\n`;
        message += `   ⏳ الانتظار: ${formattedCooldown}\n`;
        message += `   📈 الخبرة: +${resource.experience} EXP\n`;
      }
    }

    if (!found) {
        message += "\n❌ لا توجد موارد قابلة للجمع هنا حاليًا.";
    }

    message += `\n\n💡 استخدم: اجمع [اسم المورد]`;
    return { message };
  }

  async gatherResources(player, resourceId) {
    this._cleanupCooldowns();
    
    if (this._isOnCooldown(player.userId)) {
      const remainingTime = this._getRemainingCooldown(player.userId);
      const formattedTime = this._formatCooldown(remainingTime);
      const cooldownData = this.gatheringCooldowns.get(player.userId);
      const lastResource = this._translateItemName(cooldownData?.resourceId) || 'المورد';
      
      return { 
        error: `⏳ انتظر! لا يمكنك التجميع الآن.\n\n📦 آخر مورد: ${lastResource}\n⏱️ الوقت المتبقي: ${formattedTime}\n\n⚠️ لا ترسل سبام!` 
      };
    }

    // ✅ حل الترجمة: نقبل العربي أو الإنجليزي
    const resolvedResourceId = this._resolveResourceId(resourceId);
    const resource = this.allResources[resolvedResourceId];
    const playerLocationId = player?.currentLocation || 'forest';
    const locationName = this._getLocationName(playerLocationId);

    if (!resource) {
      return { error: `❌ المورد "${resourceId}" غير موجود.` };
    }

    if (!resource.locations || !Array.isArray(resource.locations)) {
      return { error: `❌ ${this._translateItemName(resolvedResourceId)} ليس مورداً قابلاً للجمع.` };
    }

    if (!resource.items || !resource.gatherTime) {
      return { error: `❌ ${this._translateItemName(resolvedResourceId)} ليس مورداً قابلاً للجمع.` };
    }

    if (!resource.locations.includes(playerLocationId)) {
      return { error: `❌ لا يمكنك جمع ${this._translateItemName(resolvedResourceId)} في ${locationName}.` };
    }

    const cooldownTime = this._getCooldownByRarity(resource.rarity || 'common');
    this._setCooldown(player.userId, cooldownTime);
    
    const cooldownData = this.gatheringCooldowns.get(player.userId);
    cooldownData.resourceId = resolvedResourceId;
    cooldownData.resourceName = this._translateItemName(resolvedResourceId);

    let totalQuantity = 0;
    let itemsGained = [];
    
    for (const itemDrop of resource.items) {
      if (Math.random() <= itemDrop.chance) {
        const quantity = Math.floor(Math.random() * (itemDrop.max - itemDrop.min + 1)) + itemDrop.min;
        
        if (quantity > 0) {
            const itemName = this._translateItemName(itemDrop.itemId);
            player.addItem(itemDrop.itemId, itemName, 'resource', quantity);
            itemsGained.push({ name: itemName, quantity });
            totalQuantity += quantity;
        }
      }
    }
    
    const emoji = this._getResourceEmoji(resolvedResourceId);
    const formattedCooldown = this._formatCooldown(cooldownTime);
    const resourceName = this._translateItemName(resolvedResourceId);
    
    if (totalQuantity === 0) {
        return { 
          success: false, 
          message: `${emoji} حاولت جمع ${resourceName} لكنك لم تجد شيئًا!\n\n⏳ وقت الانتظار: ${formattedCooldown}` 
        };
    }

    player.addExperience(resource.experience || 0);
    await player.save(); 
    
    const itemsMessage = itemsGained.map(item => `   • ${item.quantity} × ${item.name}`).join('\n');

    return {
      success: true,
      message: `${emoji} تم جمع ${resourceName} بنجاح!\n\nالموارد المكتسبة:\n${itemsMessage}\n\n📈 +${resource.experience || 0} خبرة\n\n⏳ وقت الانتظار: ${formattedCooldown}`,
      gainedExp: resource.experience || 0
    };
  }

  _resolveResourceId(input) {
    const lower = input.trim().toLowerCase();
    
    // 1. معرف مباشر
    if (this.allResources[lower]) return lower;
    
    // 2. مطابقة الاسم العربي
    for (const id in this.allResources) {
      if (this.allResources[id].name?.toLowerCase() === lower) return id;
    }
    
    // 3. مطابقة جزئية
    for (const id in this.allResources) {
      if (this.allResources[id].name?.toLowerCase().includes(lower)) return id;
    }
    
    return lower;
  }
      }
