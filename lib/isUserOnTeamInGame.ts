import { Session } from '../types';

export default function isOnTeamInGame(
  gameData: Record<string, unknown>,
  session: Session
): boolean {
  const topTeamId = gameData?.topTeam?.id;
  const bottomTeamId = gameData?.bottomTeam?.id;

  const { teams } = session.data;

  return false;
}
