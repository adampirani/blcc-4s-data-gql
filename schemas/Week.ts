import { list } from '@keystone-next/keystone/schema';
import { integer, relationship, virtual } from '@keystone-next/fields';

export const Week = list({
  fields: {
    label: virtual({
      graphQLReturnType: 'String',
      resolver(week) {
        return `${week.number}`;
      },
    }),
    league: relationship({ ref: 'League.weeks' }),
    games: relationship({ ref: 'Game.week', many: true }),
    number: integer({ isRequired: true }),
  },
  ui: {
    listView: {
      initialColumns: ['league', 'number'],
    },
  },
});
