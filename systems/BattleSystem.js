import { monsters } from '../../data/monsters.js';

export class BattleSystem {
  constructor(player) {
    this.player = player;
    this.currentMonster = null;
  }

  startBattle(monsterId) {
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) {
      return console.log('لا يوجد وحش بهذا المعرف.');
    }
    this.currentMonster = { ...monster };
    console.log(`بدأت معركة ضد ${monster.name}!`);
    // منطق المعركة التبادلي
  }

  attack() {
    if (!this.currentMonster) return;
    // منطق الهجوم
    console.log('هاجمت الوحش!');
  }

  runAway() {
    if (!this.currentMonster) return;
    console.log('لقد هربت من المعركة!');
    this.currentMonster = null;
  }
}