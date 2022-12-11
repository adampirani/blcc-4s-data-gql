import { integer, relationship, text, timestamp } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const Game = list({
  fields: {
    league: relationship({
      ref: 'League',
    }),
    week: relationship({
      ref: 'Week.games',
    }),
    sheet: integer({
      isRequired: true,
    }),
    slug: text(),
    topTeam: relationship({
      ref: 'Team',
    }),
    bottomTeam: relationship({
      ref: 'Team',
    }),
    ends: relationship({
      ref: 'End.game',
      many: true,
    }),
    image: relationship({
      ref: 'GameImage.game',
      ui: {
        displayMode: 'cards',
        cardFields: ['image'],
        inlineCreate: { fields: ['image'] },
        inlineEdit: { fields: ['image'] },
      },
    }),
    dateSubmitted: timestamp(),
    submittedBy: text(),
  },
  ui: {
    labelField: 'slug',
    listView: {
      initialColumns: [
        'league',
        'week',
        'sheet',
        'topTeam',
        'bottomTeam',
        'dateSubmitted',
        'submittedBy',
        'image',
      ],
      initialSort: { field: 'league', direction: 'DESC' },
    },
  },
});
