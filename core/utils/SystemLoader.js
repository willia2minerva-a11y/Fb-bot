// core/commands/utils/SystemLoader.js
export class SystemLoader {
    static systems = {
        'battle': '../../systems/battle/BattleSystem.js',
        'world': '../../systems/world/WorldMap.js',
        'gathering': '../../systems/gathering/GatheringSystem.js',
        'profile': '../../systems/profile/ProfileSystem.js',
        'registration': '../../systems/registration/RegistrationSystem.js',
        'autoResponse': '../../systems/autoResponse/AutoResponseSystem.js',
        'travel': '../../systems/world/TravelSystem.js',
        'crafting': '../../systems/crafting/CraftingSystem.js',
        'furnace': '../../systems/furnace/FurnaceSystem.js',
        'transaction': '../../systems/economy/TransactionSystem.js',
        'gate': '../../systems/world/GateSystem.js'
    };

    static async loadSystem(systemName) {
        try {
            if (this.systems[systemName]) {
                const module = await import(this.systems[systemName]);
                const SystemClass = module.default || Object.values(module)[0];
                if (SystemClass) {
                    console.log(`✅ تم تحميل النظام: ${systemName}`);
                    return new SystemClass();
                }
            }
        } catch (error) {
            console.log(`⚠️ System ${systemName} not available:`, error.message);
        }
        return null;
    }
}