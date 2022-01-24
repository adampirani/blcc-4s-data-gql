import { leagues } from './data/leagues';

export async function insertSeedLeagues(ks: any) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const keystone = ks.keystone || ks;
  const adapter = keystone.adapters?.MongooseAdapter || keystone.adapter;

  console.log(`🌱 Inserting Seed Data: ${leagues.length} leagues`);
  const { mongoose } = adapter;
  for (const league of leagues) {
    console.log(`  🛍️ Adding League: ${league.name}`);
    await mongoose.model('League').create(league);
  }
  console.log(`✅ Seed Data Inserted: ${leagues.length} leagues`);
  console.log('👋 Please start the process with `yarn dev` or `npm run dev`');
  process.exit();
}
