import { KeystoneContext } from '@keystone-next/types';
import { EndCreateInput, GameUpdateInput } from '../.keystone/schema-types';
// import { Session } from '../types';

export default async function submitScore(
  root: any,
  {
    gameId,
    gameData,
    userName,
  }: { gameId: string; gameData: any; userName: string },
  context: KeystoneContext
): Promise<GameUpdateInput> {
  // 1. TODO: query current user, see if signed in
  //   const session = context.session as Session;
  //   if (!session.itemId) {
  //     throw new Error('You must be logged in to do this');
  //   }

  // 2. delete existing ends
  const existingEnds = await context.lists.End.findMany({
    where: { game: { id: gameId } },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  const existingEndsIds: readonly string[] = existingEnds.map((end) => end.id);

  const deletedEnds = await context.lists.End.deleteMany({
    ids: existingEndsIds,
  });

  if (existingEnds.length !== deletedEnds.length) {
    throw new Error('Error deleting existing ends');
  }

  // 3. create new ends
  const endsToCreate: EndCreateInput[] = gameData.ends.map((end, index) => ({
    score: end.score,
    scoringTeam: end.scoringTeam,
    number: index + 1,
  }));

  // 4. return updated game
  return context.lists.Game.updateOne({
    id: gameId,
    data: {
      topTeam: { connect: { id: gameData.topTeam.id } },
      bottomTeam: { connect: { id: gameData.bottomTeam.id } },
      ends: { create: endsToCreate },
      dateSubmitted: new Date().toISOString(),
      submittedBy: userName,
    },
  }) as GameUpdateInput;
}
