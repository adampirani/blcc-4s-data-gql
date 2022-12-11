import { list } from '@keystone-next/keystone/schema';
import {
  integer,
  relationship,
  timestamp,
  virtual,
} from '@keystone-next/fields';

export const Week = list({
  fields: {
    label: virtual({
      graphQLReturnType: 'String',
      async resolver(week: { league: string; number: number }, _args, context) {
        const league: { slug: string } = await context.lists.League.findOne({
          where: { id: week.league.toString() },
          resolveFields: 'slug',
        });
        return `${league.slug}-${week.number}`;
      },
    }),
    league: relationship({ ref: 'League.weeks' }),
    games: relationship({ ref: 'Game.week', many: true }),
    number: integer({ isRequired: true }),
    date: timestamp(),
  },
  ui: {
    listView: {
      initialColumns: ['label', 'league', 'number'],
      initialSort: { field: 'date', direction: 'DESC' },
    },
  },
});
