import { list } from '@keystone-next/keystone/schema';
import { text, password, relationship } from '@keystone-next/fields';

export const User = list({
  // access:
  // ui:
  fields: {
    name: text({ isRequired: true }),
    email: text({ isRequired: true, isUnique: true }),
    password: password({ isRequired: true }),
    teams: relationship({
      ref: 'Team',
      many: true,
    }),
    role: relationship({
      ref: 'Role.assignedTo',
      // access: {}
    }),
    // TODO: add roles
  },
});
