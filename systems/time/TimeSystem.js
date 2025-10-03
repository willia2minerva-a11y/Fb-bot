export class TimeSystem {
  constructor() {
    this.time = 0; // مثال: 0 = صباح، 1 = مساء
    this.day = 1;
  }

  nextTick() {
    this.time = (this.time + 1) % 2;
    if (this.time === 0) this.day++;
    console.log(this.time === 0 ? 'نهار جديد!' : 'حلّ الليل، انتبه من الوحوش!');
  }
}
