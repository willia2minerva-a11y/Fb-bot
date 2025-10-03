export class WorldMap {
  constructor(travelSystem) {
    this.travelSystem = travelSystem;
  }

  showMap(player) {
    const currentLocation = this.travelSystem.getCurrentLocation(player);
    const availableLocations = this.travelSystem.getAvailableLocations(player);

    let mapText = `🗺️ **خريطة مغارة غولد**\n\n`;
    
    availableLocations.forEach(location => {
      const indicator = location.id === currentLocation.id ? '📍 ' : '• ';
      mapText += `${indicator}**${location.name}**\n`;
      mapText += `   📍 ${location.description}\n`;
      mapText += `   ⚡ المستوى المطلوب: ${location.requiredLevel}\n\n`;
    });

    mapText += `أنت حالياً في: **${currentLocation.name}**`;
    return mapText;
  }

  showLocationDetails(locationId) {
    const location = this.travelSystem.locations.find(loc => loc.id === locationId);
    if (!location) return "❌ المكان غير موجود.";

    let details = `🏞️ **${location.name}**\n\n`;
    details += `📝 ${location.description}\n\n`;
    details += `📊 **المعلومات:**\n`;
    details += `• 🎯 المستوى المطلوب: ${location.requiredLevel}\n`;
    details += `• ⚔️ مستوى الخطر: ${location.dangerLevel}/5\n`;
    details += `• 🌿 الموارد: ${location.resources?.join(', ') || 'غير معروفة'}\n`;
    details += `• 🐉 الوحوش: ${location.monsters?.join(', ') || 'غير معروفة'}\n`;

    return details;
  }
}
