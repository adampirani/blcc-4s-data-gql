import { integer, text, checkbox, relationship } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const Team = list({
  // TODO
  // access:
  fields: {
    league: relationship({
      ref: 'League',
    }),
    number: integer(),
    slug: text({ isUnique: true, isRequired: true }),
    name: text({ isRequired: true }),
    division: text({
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
  },
  ui: {
    listView: {
      initialColumns: ['name', 'league', 'slug'],
    },
  },
});
