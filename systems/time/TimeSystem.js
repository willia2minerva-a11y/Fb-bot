export class TimeSystem {
  constructor() {
    this.gameTime = {
      day: 1,
      hour: 8, // 8 AM بداية اليوم
      minute: 0
    };
    this.timeMultiplier = 1; // لتسريع الوقت إذا needed
    this.lastUpdate = Date.now();
    this.seasons = ['الربيع', 'الصيف', 'الخريف', 'الشتاء'];
    this.currentSeason = 0; // الربيع
  }

  update() {
    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    
    // تحديث الوقت (كل دقيقة حقيقية = 1 ساعة لعبة)
    const gameMinutesPassed = (elapsed / (60000 / this.timeMultiplier)) * 60;
    this.gameTime.minute += gameMinutesPassed;

    this.normalizeTime();
    this.lastUpdate = now;

    // تغيير الموسم كل 7 أيام لعبة
    if (this.gameTime.day % 7 === 0 && this.gameTime.hour === 0) {
      this.currentSeason = (this.currentSeason + 1) % this.seasons.length;
    }
  }

  normalizeTime() {
    while (this.gameTime.minute >= 60) {
      this.gameTime.minute -= 60;
      this.gameTime.hour += 1;
    }

    while (this.gameTime.hour >= 24) {
      this.gameTime.hour -= 24;
      this.gameTime.day += 1;
    }
  }

  getCurrentTime() {
    this.update(); // تحديث الوقت أولاً
    
    const period = this.gameTime.hour < 12 ? 'صباحاً' : 
                  this.gameTime.hour < 18 ? 'بعد الظهر' : 'مساءاً';
    
    const hour12 = this.gameTime.hour % 12 || 12;
    const minuteStr = this.gameTime.minute.toString().padStart(2, '0');

    return {
      time: `${hour12}:${minuteStr} ${period}`,
      day: this.gameTime.day,
      season: this.seasons[this.currentSeason],
      hour: this.gameTime.hour,
      minute: this.gameTime.minute,
      isDay: this.gameTime.hour >= 6 && this.gameTime.hour < 18,
      isNight: this.gameTime.hour >= 18 || this.gameTime.hour < 6
    };
  }

  getTimeEffects() {
    const time = this.getCurrentTime();
    const effects = {
      monsterSpawnRate: 1.0,
      monsterStrength: 1.0,
      resourceAbundance: 1.0,
      playerRegeneration: 1.0,
      visibility: 'جيدة'
    };

    // تأثيرات الليل
    if (time.isNight) {
      effects.monsterSpawnRate = 1.5;
      effects.monsterStrength = 1.2;
      effects.resourceAbundance = 0.8;
      effects.playerRegeneration = 0.7;
      effects.visibility = 'منخفضة';
    }

    // تأثيرات الصباح الباكر
    if (time.hour >= 4 && time.hour < 6) {
      effects.monsterSpawnRate = 0.5;
      effects.resourceAbundance = 1.3; // ندى الصباح يجعل الموارد أفضل
    }

    // تأثيرات الموسم
    switch (time.season) {
      case 'الربيع':
        effects.resourceAbundance *= 1.2;
        break;
      case 'الصيف':
        effects.monsterSpawnRate *= 1.1;
        break;
      case 'الخريف':
        effects.playerRegeneration *= 1.1;
        break;
      case 'الشتاء':
        effects.resourceAbundance *= 0.8;
        effects.playerRegeneration *= 0.9;
        break;
    }

    return effects;
  }

  getTimeMessage() {
    const time = this.getCurrentTime();
    const effects = this.getTimeEffects();

    let message = `⏰ **الوقت الحالي: ${time.time}**\n\n`;
    message += `📅 اليوم: ${time.day}\n`;
    message += `🍂 الموسم: ${time.season}\n\n`;
    message += `🌍 **تأثيرات الوقت:**\n`;
    message += `• 👹 ظهور الوحوش: ${this.formatMultiplier(effects.monsterSpawnRate)}\n`;
    message += `• ⚔️ قوة الوحوش: ${this.formatMultiplier(effects.monsterStrength)}\n`;
    message += `• 🌿 وفرة الموارد: ${this.formatMultiplier(effects.resourceAbundance)}\n`;
    message += `• 💚 استشفاء اللاعب: ${this.formatMultiplier(effects.playerRegeneration)}\n`;
    message += `• 👁️ الرؤية: ${effects.visibility}`;

    return message;
  }

  formatMultiplier(multiplier) {
    if (multiplier > 1) return `🟢 +${Math.round((multiplier - 1) * 100)}%`;
    if (multiplier < 1) return `🔴 -${Math.round((1 - multiplier) * 100)}%`;
    return `⚪ عادي`;
  }

  // للتقدم السريع في الوقت (للتطوير)
  advanceTime(hours) {
    this.gameTime.hour += hours;
    this.normalizeTime();
    return this.getCurrentTime();
  }

  // الحصول على معلومات الوقت للمعارك
  getBattleTimeEffects() {
    const time = this.getCurrentTime();
    const effects = this.getTimeEffects();

    return {
      playerAttackMultiplier: time.isDay ? 1.0 : 0.9,
      monsterAttackMultiplier: time.isNight ? 1.1 : 1.0,
      criticalChance: time.isDay ? 1.05 : 1.0,
      escapeChance: time.isNight ? 0.9 : 1.0
    };
  }
}
