import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { End } from './schemas/End';
import { Game } from './schemas/Game';
import { GameImage } from './schemas/GameImage';
import { League } from './schemas/League';
import { Team } from './schemas/Team';
import { User } from './schemas/User';
import { Week } from './schemas/Week';
import { Role } from './schemas/Role';
import { Substitution } from './schemas/Substitution';
import { extendGraphqlSchema } from './resolvers';
import { insertSeedEnds } from './seed-data/seedEnds';
import { insertSeedLeagues } from './seed-data/seedLeagues';
import { insertSeedTeams } from './seed-data/seedTeams';
import { insertSeedGames } from './seed-data/seedGames';
import { formatGameWeeks } from './seed-data/formatGameWeeks';
import { permissionsList } from './schemas/fields';

const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-blcc-data';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long to stay signed in
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

const corsOrigin = process.env.FRONTEND_URL_REGEX
  ? new RegExp(process.env.FRONTEND_URL_REGEX)
  : process.env.FRONTEND_URL || 'http://localhost:3000';

export default withAuth(
  config({
    server: {
      cors: {
        origin: corsOrigin,
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      // Seed data if flag present
      async onConnect(keystone) {
        if (process.argv.includes('--seed-league')) {
          await insertSeedLeagues(keystone);
        } else if (process.argv.includes('--seed-teams')) {
          await insertSeedTeams(keystone);
        } else if (process.argv.includes('--seed-games')) {
          await insertSeedGames(keystone);
        } else if (process.argv.includes('--seed-ends')) {
          await insertSeedEnds(keystone);
        } else if (process.argv.includes('--format-game-weeks')) {
          await formatGameWeeks(keystone);
        }
      },
    },
    lists: createSchema({
      // Schema items go in here
      User,
      League,
      Team,
      End,
      Game,
      GameImage,
      Week,
      Substitution,
      Role,
    }),
    extendGraphqlSchema,
    ui: {
      // Show the UI only for ppl who pass this test
      isAccessAllowed: ({ session }) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL Query
      User: `id name email role { ${permissionsList.join(' ')} }`,
    }),
  })
);
