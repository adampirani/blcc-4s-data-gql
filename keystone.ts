import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { League } from './schemas/League';
import { Team } from './schemas/Team';
// import { Product } from './schemas/Product';
// import { ProductImage } from './schemas/ProductImage';
import { insertSeedLeagues } from './seed-data/seedLeagues';
import { insertSeedTeams } from './seed-data/seedTeams';

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
    // TODO: Add in initial roles here
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
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
        }
      },
    },
    lists: createSchema({
      // Schema items go in here
      User,
      League,
      Team,
      // ProductImage,
    }),
    ui: {
      // Show the UI only for ppl who pass this test
      isAccessAllowed: ({ session }) => {
        console.log(session);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return !!session?.data;
      },
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL Query
      User: 'id name email',
    }),
  })
);
