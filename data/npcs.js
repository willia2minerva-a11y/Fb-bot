export const npcs = [
  {
    id: 'blacksmith',
    name: 'الحداد',
    type: 'crafting',
    location: 'القرية',
    description: 'يصنع الأسلحة والدروع القوية',
    services: ['صناعة أسلحة', 'تطوير معدات'],
    requirements: { level: 1 }
  },
  {
    id: 'merchant',
    name: 'التاجر',
    type: 'merchant', 
    location: 'القرية',
    description: 'يبيع ويشتري البضائع',
    services: ['شراء موارد', 'بيع كنوز'],
    requirements: { level: 1 }
  },
  {
    id: 'trainer',
    name: 'المدرب',
    type: 'training',
    location: 'القرية',
    description: 'يعلمك المهارات القتالية',
    services: ['تعلم مهارات', 'تحسين قدرات'],
    requirements: { level: 5 }
  },
  {
    id: 'alchemist',
    name: 'الخيميائي',
    type: 'alchemy',
    location: 'القرية',
    description: 'يصنع الجرعات والترياقات',
    services: ['صناعة جرعات', 'خلط مواد'],
    requirements: { level: 3 }
  },
  {
    id: 'elder',
    name: 'شيخ القرية',
    type: 'quest',
    location: 'القرية',
    description: 'زعيم القرية والحكيم',
    services: ['مهام رئيسية', 'نصائح'],
    requirements: { level: 1 }
  }
];
