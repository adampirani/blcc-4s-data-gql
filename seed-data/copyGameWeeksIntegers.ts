import { KeystoneContext } from '@keystone-next/types';
import { Mongoose } from 'mongoose';

export async function copyGameWeeksIntegers(ks: KeystoneContext) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const { keystone } = ks;
  const { adapter } = keystone;
  const mongoose = adapter.mongoose as Mongoose;

  const allGames = await mongoose.model('Game').find({}).exec();

  console.log(`🎯 Formatting game dates Data: ${allGames.length} games`);
  for (const game of allGames) {
    const { slug } = game;

    const slugArray = slug.split('-');
    const weekNum = parseInt(slugArray[slugArray.length - 2]);
    game.weekInteger = weekNum;

    await game.save();
  }
  console.log(`✅ Formatted games: ${allGames.length}`);
  console.log('👋 Please start the process with `yarn dev` or `npm run dev`');
  process.exit();
}
