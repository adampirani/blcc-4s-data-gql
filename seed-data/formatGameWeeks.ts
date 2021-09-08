export async function formatGameWeeks(ks: any) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const keystone = ks.keystone || ks;
  const adapter = keystone.adapters?.MongooseAdapter || keystone.adapter;
  const { mongoose } = adapter;

  const allGames = await mongoose.model('Game').find({}).exec();

  console.log(`🎯 Formatting game dates Data: ${allGames.length} games`);
  for (const game of allGames) {
    const { _id, slug, league } = game;

    const slugArray = slug.split('-');
    const weekNum = parseInt(slugArray[slugArray.length - 2]);

    const existingWeek = await mongoose
      .model('Week')
      .findOne({
        league,
        number: weekNum,
      })
      .exec();

    let weekId;

    if (existingWeek) {
      weekId = existingWeek._id;
    } else {
      console.log('creating a new week');
      const { _id: newWeekId } = await mongoose
        .model('Week')
        .create({ league, number: weekNum });
      weekId = newWeekId;
    }

    game.week = weekId;
    await game.save();
  }
  console.log(`✅ Formatted games: ${allGames.length}`);
  console.log('👋 Please start the process with `yarn dev` or `npm run dev`');
  process.exit();
}
