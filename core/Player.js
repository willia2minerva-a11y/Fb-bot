export class Player {
  constructor() {
    this.id = Math.floor(Math.random() * 1000000);
    this.name = 'مغامر';
    this.location = 'village';
    this.health = 100;
    this.mana = 50;
    this.gold = 0;
    this.inventory = [];
    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null,
    };
    this.skills = [];
    this.quests = [];
    this.level = 1;
    this.experience = 0;
    this.banned = false;
    this.restrictedCommands = [];
  }

  addItem(item) {
    this.inventory.push(item);
  }

  hasItem(itemId) {
    return this.inventory.some(item => item.id === itemId);
  }
}