export const items = {
  // مواد أساسية
  wood: {
    id: 'wood',
    name: 'خشب',
    type: 'resource',
    description: 'خشب عادي يمكن استخدامه في الصناعة.'
  },
  stone: {
    id: 'stone',
    name: 'حجر',
    type: 'resource',
    description: 'حجر صلب يمكن استخدامه في البناء.'
  },
  herb: {
    id: 'herb',
    name: 'عشب طبي',
    type: 'resource',
    description: 'عشب يستخدم في صناعة الأدوية.'
  },
  
  // أسلوبة بسيطة
  wooden_sword: {
    id: 'wooden_sword',
    name: 'سيف خشبي',
    type: 'weapon',
    description: 'سيف مصنوع من الخشب، ضعيف لكنه أفضل من لا شيء.',
    damage: 5
  },
  
  // أدوات
  basic_pickaxe: {
    id: 'basic_pickaxe',
    name: 'فأس أساسي',
    type: 'tool',
    description: 'فأس بسيط لجمع الموارد.',
    efficiency: 1
  }
};
