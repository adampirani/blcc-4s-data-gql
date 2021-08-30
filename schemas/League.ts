import { integer, text, checkbox } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const League = list({
  // TODO
  // access:
  fields: {
    slug: text({ isUnique: true, isRequired: true }),
    name: text({ isUnique: true, isRequired: true }),
    isActive: checkbox({ defaultValue: false }),
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
      initialColumns: ['name', 'slug', 'isActive', 'currentWeek'],
    },
  },
});
