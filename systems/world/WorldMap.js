export class WorldMap {
  constructor(locations) {
    this.locations = locations;
  }

  showMap() {
    this.locations.forEach(loc =>
      console.log(`${loc.name}: ${loc.description}`)
    );
  }

  moveTo(locationId, player) {
    // تحقق من قابلية الانتقال
    player.location = locationId;
    console.log(`انتقلت إلى ${locationId}`);
  }
}
