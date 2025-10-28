// core/commands/utils/ArabicItemMap.js
import { items } from '../../data/items.js';
import { locations } from '../../data/locations.js';

export class ArabicItemMap {
    static create() {
        const itemMap = {};
        
        // تعيين العناصر
        for (const itemId in items) {
            const itemName = items[itemId].name;
            itemMap[itemName.toLowerCase()] = itemId;
        }
        
        // تعيين المواقع
        for (const locationId in locations) {
            const locationName = locations[locationId].name;
            itemMap[locationName.toLowerCase()] = locationId;
            if (locationName.startsWith('ال')) {
                itemMap[locationName.substring(2).toLowerCase()] = locationId;
            }
        }
        
        return itemMap;
    }

    static translate(input, itemMap) {
        return itemMap[input.toLowerCase()] || input.toLowerCase();
    }
}
