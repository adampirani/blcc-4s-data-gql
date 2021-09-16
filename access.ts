// Simple example, yes or no based on session

import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs): boolean {
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

// Permissions check if someone meets a criteria - yes or no
export const permissions = {
  ...generatedPermissions,
};

// Rule based functions
// Rules can return a boolean or a filter that limits what they can CRUD
export const rules = {
  canManageTeams({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // Do they have the same permission
    if (permissions.canManageTeams({ session })) {
      return true;
    }

    return false;
  },
  canManageUsers({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }

    if (permissions.canManageUsers({ session })) {
      return true;
    }

    // Only update themselves
    return { id: session.itemId };
  },
  // TODO, test this out by changing scores for team that isn't yours
  canEditGames({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // Do they have the same permission
    // if not, does the game involve one of their teams
    if (permissions.canManageLeagues({ session })) {
      return true;
    }

    console.log('user teams');
    console.log(session?.data?.teams);

    const userTeams: { id: string }[] = session?.data?.teams || [];
    const userTeamsIds = userTeams.map((team) => team.id);

    console.log({ userTeamsIds });

    return {
      or: [
        { topTeam: { id: { in: userTeamsIds } } },
        { bottomTeam: { id: { in: userTeamsIds } } },
      ],
    };
  },
};
