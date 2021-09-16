import { list } from '@keystone-next/keystone/schema';
import { text, password, relationship } from '@keystone-next/fields';
import { permissions } from '../access';

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
      access: {
        create: permissions.canManageUsers,
        update: permissions.canManageUsers,
      },
    }),
  },
});
