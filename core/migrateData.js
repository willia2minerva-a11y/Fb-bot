// core/migrateData.js
import mongoose from 'mongoose';

// استيراد جميع ملفات البيانات
import * as accessoriesData from '../data/accessories.js';
import * as armorsData from '../data/armors.js';
import * as craftingData from '../data/crafting.js';
import * as gatesData from '../data/gates.js';
import * as itemsData from '../data/items.js';
import * as itemsGatesData from '../data/items_gates.js';
import * as locationsData from '../data/locations.js';
import * as monstersData from '../data/monsters.js';
import * as npcsData from '../data/npcs.js';
import * as recipesData from '../data/recipes.js';
import * as resourcesData from '../data/resources.js';
import * as skillsData from '../data/skills.js';
import * as weaponsData from '../data/weapons.js';

// استيراد النماذج
import { Accessory } from './models/Accessory.js';
import { Armor } from './models/Armor.js';
import { Crafting } from './models/Crafting.js';
import { Gate } from './models/Gate.js';
import { Item } from './models/Item.js';
import { ItemGate } from './models/ItemGate.js';
import { Location } from './models/Location.js';
import { Monster } from './models/Monster.js';
import { Npc } from './models/Npc.js';
import { Recipe } from './models/Recipe.js';
import { Resource } from './models/Resource.js';
import { Skill } from './models/Skill.js';
import { Weapon } from './models/Weapon.js';

/**
 * دالة عامة لترحيل كائن بيانات إلى نموذج معين
 */
async function migrateCollection(dataObject, Model, collectionName) {
  let count = 0;
  const entries = Object.entries(dataObject);
  for (const [id, data] of entries) {
    const normalized = { ...data, id };
    // تحويل المواد إذا كانت بصيغة كائن { id: count } إلى مصفوفة { id, count }
    if (normalized.materials && !Array.isArray(normalized.materials) && typeof normalized.materials === 'object') {
      normalized.materials = Object.entries(normalized.materials).map(([matId, count]) => ({ id: matId, count }));
    }
    await Model.updateOne({ id }, { $set: normalized }, { upsert: true });
    count++;
  }
  console.log(`✅ تم ترحيل ${count} عنصر إلى ${collectionName}`);
}

/**
 * الدالة الرئيسية للترحيل الكامل
 */
export async function migrateAllData() {
  try {
    console.log('🔄 بدء الترحيل التلقائي لجميع البيانات...');

    // ترحيل كل مجموعة
    await migrateCollection(accessoriesData.default || accessoriesData, Accessory, 'Accessories');
    await migrateCollection(armorsData.default || armorsData, Armor, 'Armors');
    await migrateCollection(craftingData.default || craftingData, Crafting, 'Crafting');
    await migrateCollection(gatesData.default || gatesData, Gate, 'Gates');
    await migrateCollection(itemsData.default || itemsData, Item, 'Items');
    await migrateCollection(itemsGatesData.default || itemsGatesData, ItemGate, 'ItemGates');
    await migrateCollection(locationsData.default || locationsData, Location, 'Locations');
    await migrateCollection(monstersData.default || monstersData, Monster, 'Monsters');
    await migrateCollection(npcsData.default || npcsData, Npc, 'Npcs');
    await migrateCollection(recipesData.default || recipesData, Recipe, 'Recipes');
    await migrateCollection(resourcesData.default || resourcesData, Resource, 'Resources');
    await migrateCollection(skillsData.default || skillsData, Skill, 'Skills');
    await migrateCollection(weaponsData.default || weaponsData, Weapon, 'Weapons');

    console.log('✅ اكتمل الترحيل بنجاح');
  } catch (error) {
    console.error('❌ فشل الترحيل:', error);
    throw error;
  }
}
