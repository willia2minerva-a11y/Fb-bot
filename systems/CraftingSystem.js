import { items } from '../../data/items.js';

export class CraftingSystem {
  constructor(player) {
    this.player = player;
  }

  showCraftableItems() {
    // أظهر العناصر القابلة للصناعة حسب الموارد في الحقيبة
    console.log('العناصر التي يمكنك صناعتها: ...');
  }

  craft(itemId) {
    // تحقق من الموارد وصنع العنصر
    console.log(`تم صناعة العنصر ${itemId}!`);
  }
}