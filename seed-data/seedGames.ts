import { games } from './games';

export async function insertSeedGames(ks: any) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const keystone = ks.keystone || ks;
  const adapter = keystone.adapters?.MongooseAdapter || keystone.adapter;

  console.log(`🌱 Inserting Seed Data: ${games.length} games`);
  const { mongoose } = adapter;
  for (const game of games) {
    const {
      league,
      week,
      sheet,
      slug,
      topTeam,
      bottomTeam,
      dateSubmitted,
      submittedBy,
    } = game;

    const leagueObject = await mongoose
      .model('League')
      .findOne({
        slug: league,
      })
      .exec();

    const topTeamObject = await mongoose
      .model('Team')
      .findOne({
        slug: topTeam,
      })
      .exec();

    const bottomTeamObject = await mongoose
      .model('Team')
      .findOne({
        slug: bottomTeam,
      })
      .exec();

    console.log(
      `  🛍️ Adding Game: ${game.slug} to league ${leagueObject.name}`
    );

    await mongoose.model('Game').create({
      league: leagueObject._id,
      week: parseInt(week),
      sheet: parseInt(sheet),
      slug,
      topTeam: topTeamObject._id,
      bottomTeam: bottomTeamObject._id,
      dateSubmitted: dateSubmitted ? new Date(dateSubmitted) : new Date(),
      submittedBy,
    });
  }
  console.log(`✅ Seed Data Inserted: ${games.length} games`);
  console.log('👋 Please start the process with `yarn dev` or `npm run dev`');
  process.exit();
}
