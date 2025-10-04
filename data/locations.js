export const locations = {
  village: {
    id: 'village',
    name: 'القرية',
    description: 'قرية صغيرة وهادئة، مكان آمن للاسترخاء.',
    type: 'safe',
    resources: [],
    monsters: []
  },
  forest: {
    id: 'forest',
    name: 'الغابة الخضراء',
    description: 'غابة خضراء مليئة بالأشجار والوحوش.',
    type: 'wild',
    resources: ['wood', 'herb'],
    monsters: ['forest_goblin', 'forest_wolf']
  }
};
