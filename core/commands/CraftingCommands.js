// core/commands/CraftingCommands.js
import { BaseCommand } from './BaseCommand.js';

export class CraftingCommands extends BaseCommand {
  getCommands() {
    return {
      'وصفات': this.handleShowRecipes.bind(this),
      'صناعة': this.handleShowRecipes.bind(this),
      'صناعة_كاملة': this.handleShowAllRecipes.bind(this),
      'وصفات_كاملة': this.handleShowAllRecipes.bind(this),
      'اصنع': this.handleCraft.bind(this),
      'صنع': this.handleCraft.bind(this),
      'فرن': this.handleFurnace.bind(this),
      'فرن_كاملة': this.handleFullFurnace.bind(this),
      'طهو': this.handleCook.bind(this),
      'صهر': this.handleSmelt.bind(this),
      'جهز': this.handleEquip.bind(this),
      'تجهيز': this.handleEquip.bind(this),
      'البس': this.handleEquip.bind(this),
      'انزع': this.handleUnequip.bind(this),
      'خلع': this.handleUnequip.bind(this)
    };
  }

  async handleShowRecipes(player) {
    if (!await this.checkPlayerApproval(player)) return;
    const system = await this.getSystem('crafting');
    if (!system) return '❌ نظام الصناعة غير متوفر';
    return system.showAvailableRecipes(player).message;
  }

  async handleShowAllRecipes(player) {
    if (!await this.checkPlayerApproval(player)) return;
    const system = await this.getSystem('crafting');
    if (!system) return '❌ نظام الصناعة غير متوفر';
    return system.showAvailableRecipes(player, true).message;
  }

  async handleCraft(player, args) {
    if (!await this.checkPlayerApproval(player)) return;
    if (args.length === 0) return this.handleShowRecipes(player);

    let quantity = 1;
    let nameParts = [...args];
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg)) {
      quantity = parseInt(lastArg);
      nameParts = args.slice(0, -1);
      if (quantity < 1 || quantity > 100) return '❌ الكمية بين 1 و 100';
    }
    const rawName = nameParts.join(' ');
    const itemId = this.commandHandler.ARABIC_ITEM_MAP?.[rawName.toLowerCase()] || rawName.toLowerCase();

    const system = await this.getSystem('crafting');
    if (!system) return '❌ نظام الصناعة غير متوفر';
    const result = await system.craftItem(player, itemId, quantity);
    return result.error || result.message;
  }

  async handleFurnace(player) {
    if (!await this.checkPlayerApproval(player)) return;
    const system = await this.getSystem('crafting');
    if (!system) return '❌ نظام الفرن غير متوفر';
    return system.showFurnaceRecipes(player).message;
  }

  async handleFullFurnace(player) {
    if (!await this.checkPlayerApproval(player)) return;
    const system = await this.getSystem('crafting');
    if (!system) return '❌ نظام الفرن غير متوفر';
    return system.showFurnaceRecipes(player, true).message;
  }

  async handleCook(player, args) {
    if (!await this.checkPlayerApproval(player)) return;
    if (args.length === 0) return '❌ حدد الطعام: طهو لحم 2';
    let quantity = 1;
    let nameParts = [...args];
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg)) {
      quantity = parseInt(lastArg);
      nameParts = args.slice(0, -1);
      if (quantity < 1 || quantity > 50) return '❌ الكمية بين 1 و 50';
    }
    const itemName = nameParts.join(' ');
    const system = await this.getSystem('crafting');
    if (!system) return '❌ نظام الفرن غير متوفر';
    const result = await system.cook(player, itemName, quantity);
    return result.error || result.message;
  }

  async handleSmelt(player, args) {
    if (!await this.checkPlayerApproval(player)) return;
    if (args.length === 0) return '❌ حدد الخام: صهر خام_حديد 3';
    let quantity = 1;
    let nameParts = [...args];
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg)) {
      quantity = parseInt(lastArg);
      nameParts = args.slice(0, -1);
      if (quantity < 1 || quantity > 50) return '❌ الكمية بين 1 و 50';
    }
    const itemName = nameParts.join(' ');
    const system = await this.getSystem('crafting');
    if (!system) return '❌ نظام الفرن غير متوفر';
    const result = await system.smelt(player, itemName, quantity);
    return result.error || result.message;
  }

  async handleEquip(player, args) {
    return '❌ نظام التجهيز قيد التطوير';
  }

  async handleUnequip(player, args) {
    return '❌ نظام نزع المعدات قيد التطوير';
  }
}
