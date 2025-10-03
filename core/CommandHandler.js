export class CommandHandler {
  constructor(player, game) {
    this.player = player;
    this.game = game;
  }

  handle(command) {
    if (this.player.banned) {
      return console.log('لقد تم حظرك من اللعبة.');
    }
    if (this.player.restrictedCommands.includes(command)) {
      return console.log('لا يمكنك استخدام هذا الأمر الآن.');
    }
    // تحليل وتنفيذ الأوامر
    switch (command) {
      case '!بروفايل':
        return this.showProfile();
      case '!حالتي':
        return this.showStatus();
      // أضف بقية الأوامر
      default:
        return console.log('أمر غير معروف. استخدم !مساعدة لرؤية الأوامر.');
    }
  }

  showProfile() {
    console.log(`الاسم: ${this.player.name}, المستوى: ${this.player.level}, الذهب: ${this.player.gold}`);
  }

  showStatus() {
    console.log(`الصحة: ${this.player.health}, المانا: ${this.player.mana}`);
  }
}