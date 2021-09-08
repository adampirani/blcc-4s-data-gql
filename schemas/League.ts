import {
  integer,
  text,
  checkbox,
  relationship,
  timestamp,
} from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const League = list({
  // TODO
  // access:
  fields: {
    slug: text({ isUnique: true, isRequired: true }),
    name: text({ isUnique: true, isRequired: true }),
    isActive: checkbox({ defaultValue: false }),
    weeks: relationship({ ref: 'Week.league', many: true }),
    leagueStart: timestamp(),
    currentWeek: integer({
      defaultValue: 1,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
    numRegSeasonWeeks: integer({ defaultValue: 6 }),
    hasDivisions: checkbox({
      defaultValue: false,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
  },
  ui: {
    listView: {
      initialColumns: [
        'name',
        'slug',
        'leagueStart',
        'isActive',
        'currentWeek',
      ],
      initialSort: { field: 'leagueStart', direction: 'DESC' },
    },
  },
});
