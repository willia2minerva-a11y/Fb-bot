import { resources } from './resources.js';
import { weapons } from './weapons.js';
import { armors } from './armors.js';
import { accessories } from './accessories.js';

export const items = {
  ...resources,
  ...weapons,
  ...armors,
  ...accessories
};
