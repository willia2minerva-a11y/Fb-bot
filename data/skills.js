export const skills = {
  gathering: {
    id: 'gathering',
    name: 'جمع الموارد',
    description: 'يزيد من سرعة وكفاءة جمع الموارد.',
    levels: [
      { level: 1, requiredExp: 0, effect: { speed: 1 } },
      { level: 2, requiredExp: 100, effect: { speed: 1.1 } }
    ]
  },
  combat: {
    id: 'combat',
    name: 'القتال',
    description: 'يزيد من قوة هجماتك في المعارك.',
    levels: [
      { level: 1, requiredExp: 0, effect: { damage: 1 } },
      { level: 2, requiredExp: 100, effect: { damage: 1.1 } }
    ]
  }
};
