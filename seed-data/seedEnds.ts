import { ends } from "./ends";

export async function insertSeedEnds(ks: any) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const keystone = ks.keystone || ks;
  const adapter = keystone.adapters?.MongooseAdapter || keystone.adapter;

  console.log(`🌱 Inserting Seed Data: ${ends.length} Ends`);
  const { mongoose } = adapter;
  for (const end of ends) {
    const { game, number, scoringTeam, score } = end;

    const gameObject = await mongoose
      .model("Game")
      .findOne({
        slug: game,
      })
      .exec();

    console.log(`  🛍️ Adding End: ${number} to game ${gameObject.slug}`);

    await mongoose.model("End").create({
      game: gameObject._id,
      number,
      scoringTeam: score === 0 ? "BLANK" : scoringTeam,
      score,
    });
  }
  console.log(`✅ Seed Data Inserted: ${ends.length} ends`);
  console.log("👋 Please start the process with `yarn dev` or `npm run dev`");
  process.exit();
}
