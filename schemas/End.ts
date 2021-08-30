import { integer, relationship, select } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const End = list({
  fields: {
    game: relationship({
      ref: 'Game.ends',
      many: false,
    }),
    number: integer(),
    scoringTeam: select({
      options: [
        { label: 'top', value: 'TOP' },
        { label: 'bottom', value: 'BOTTOM' },
        { label: 'blank', value: 'BLANK' },
      ],
      defaultValue: 'TOP',
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    score: integer(),
  },
  ui: {
    listView: {
      initialColumns: ['game', 'number', 'scoringTeam', 'score'],
    },
  },
});
