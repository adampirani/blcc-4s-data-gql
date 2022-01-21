import { getItems } from '@keystonejs/server-side-graphql-client';
import { teams } from './data/teams';

export async function insertSeedTeams(ks: any) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const keystone = ks.keystone || ks;
  const adapter = keystone.adapters?.MongooseAdapter || keystone.adapter;

  console.log(`🌱 Inserting Seed Data: ${teams.length} teams`);
  const { mongoose } = adapter;
  for (const team of teams) {
    const { league, number, slug, name, division } = team;

    const leagueObject = await mongoose
      .model('League')
      .findOne({
        slug: league,
      })
      .exec();

    console.log(
      `  🛍️ Adding Team: ${team.name} to league ${leagueObject.name}`
    );

    await mongoose.model('Team').create({
      league: leagueObject._id,
      number,
      slug,
      name,
      division,
    });
  }
  console.log(`✅ Seed Data Inserted: ${teams.length} teams`);
  console.log('👋 Please start the process with `yarn dev` or `npm run dev`');
  process.exit();
}
