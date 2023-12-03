import { games } from './data/games';

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
      weekDate,
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

    const weekObj = await mongoose
      .model('Week')
      .findOne({
        number: week,
        league: leagueObject._id,
      })
      .exec();

    console.log(
      `  🛍️ Adding Game: ${game.slug} to league ${leagueObject.name}`
    );

    await mongoose.model('Game').create({
      league: leagueObject._id,
      week:
        weekObj ||
        (await mongoose.model('Week').create({
          number: week,
          league: leagueObject._id,
          date: new Date(weekDate),
        })),
      sheet: parseInt(sheet),
      slug,
      weekInteger: week,
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
