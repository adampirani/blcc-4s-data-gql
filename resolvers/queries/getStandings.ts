import { KeystoneContext } from '@keystone-next/types';

const graphql = String.raw; // fake template literal

const POINTS_FOR_WIN = 2;
const POINTS_FOR_DRAW = 1;

type TeamStandings = {
  id: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  totalScored: number;
  endsWon: number;
  highEnd: number;
  recordVsOtherTeams: {
    [key: string]: {
      wins: number;
      losses: number;
      draws: number;
    };
  };
};

type GameQuery = {
  topTeam: {
    id: string;
  };
  bottomTeam: {
    id: string;
  };
  ends: [
    {
      number: number;
      scoringTeam: 'TOP' | 'BOTTOM';
      score: number;
    }
  ];
  weekInteger: number;
};

type AllLeaguesQuery = {
  numRegSeasonWeeks: number;
  games: GameQuery[];
};

type AllTeamsQuery = {
  id: string;
  name: string;
  division: string;
};

/**
 * Update `endsWon`, `totalScored` and `highEnd` for the teams involved in a game
 */
const updateTeamStats = (
  score: number,
  scoringTeam: 'TOP' | 'BOTTOM',
  topTeamObj: TeamStandings,
  bottomTeamObj: TeamStandings
) => {
  if (score > 0) {
    const scoringTeamObj = scoringTeam === 'TOP' ? topTeamObj : bottomTeamObj;
    scoringTeamObj.endsWon += 1;
    scoringTeamObj.totalScored += score;
    if (score > scoringTeamObj.highEnd) {
      scoringTeamObj.highEnd = score;
    }
  }
};

/**
 * Update the records for the two teams in a game
 * @param {Object} param0 Object with keys `topTeamObj`, `bottomTeamObj`, `topTeamScore`, `bottomTeamScore`
 */
const updateTeamRecords = ({
  topTeamObj,
  bottomTeamObj,
  topTeamScore,
  bottomTeamScore,
}: {
  topTeamObj: TeamStandings;
  bottomTeamObj: TeamStandings;
  topTeamScore: number;
  bottomTeamScore: number;
}) => {
  if (!topTeamObj.recordVsOtherTeams[bottomTeamObj.id]) {
    topTeamObj.recordVsOtherTeams[bottomTeamObj.id] = {
      wins: 0,
      losses: 0,
      draws: 0,
    };
  }
  if (!bottomTeamObj.recordVsOtherTeams[topTeamObj.id]) {
    bottomTeamObj.recordVsOtherTeams[topTeamObj.id] = {
      wins: 0,
      losses: 0,
      draws: 0,
    };
  }
  if (topTeamScore > bottomTeamScore) {
    topTeamObj.wins += 1;
    topTeamObj.points += POINTS_FOR_WIN;
    topTeamObj.recordVsOtherTeams[bottomTeamObj.id].wins += 1;
    bottomTeamObj.losses += 1;
    bottomTeamObj.recordVsOtherTeams[topTeamObj.id].losses += 1;
  } else if (bottomTeamScore > topTeamScore) {
    bottomTeamObj.wins += 1;
    bottomTeamObj.points += POINTS_FOR_WIN;
    bottomTeamObj.recordVsOtherTeams[topTeamObj.id].wins += 1;
    topTeamObj.losses += 1;
    topTeamObj.recordVsOtherTeams[bottomTeamObj.id].losses += 1;
  } else {
    // tie
    bottomTeamObj.draws += 1;
    bottomTeamObj.points += POINTS_FOR_DRAW;
    bottomTeamObj.recordVsOtherTeams[topTeamObj.id].draws += 1;
    topTeamObj.draws += 1;
    topTeamObj.points += POINTS_FOR_DRAW;
    topTeamObj.recordVsOtherTeams[bottomTeamObj.id].draws += 1;
  }
};

// Sorting / tiebreakers
const standingsSort = (teamA: TeamStandings, teamB: TeamStandings) => {
  // First sort by points (2 for wins, 1 for tie)
  const pointsDiff = teamB.points - teamA.points;
  if (pointsDiff) {
    return pointsDiff;
  }

  // Then by total points scored
  const totalScoredDiff = teamB.totalScored - teamA.totalScored;
  if (totalScoredDiff) {
    return totalScoredDiff;
  }

  // Then by head-to-head records (only covers two tied teams)
  const headToHeadRecord = teamB.recordVsOtherTeams[teamA.id];
  if (headToHeadRecord) {
    const winsSurplus = headToHeadRecord.wins - headToHeadRecord.losses;
    if (winsSurplus) {
      return winsSurplus;
    }
  }

  // Finally by highest scored end
  const highEndDiff = teamB.highEnd - teamA.highEnd;
  if (highEndDiff) {
    return highEndDiff;
  }

  return 0;
};

export default async function getStandings(
  _,
  { leagueSlug }: { leagueSlug: string },
  context: KeystoneContext
): Promise<{ teams: any; divisions: any }> {
  // 1. TODO: query current user, see if signed in
  //   const session = context.session as Session;
  //   if (!session.itemId) {
  //     throw new Error('You must be logged in to do this');
  //   }

  const divisions: {
    [key: string]: TeamStandings[];
  } = {};
  const teamIdToIndex: {
    [key: string]: number;
  } = {};

  type AllTeamsRecord = Record<'allTeams', Array<AllTeamsQuery>>;

  // Get all teams in a league
  const teamsByLeague: AllTeamsRecord = await context.graphql.run({
    query: graphql`
      query TEAMS_BY_LEAGUE_QUERY($leagueSlug: ID!) {
        allTeams(where: { league: { slug: $leagueSlug } }) {
          id
          name
          division
        }
      }
    `,
    variables: {
      leagueSlug,
    },
  });

  // Initialize team record objects
  const teams = teamsByLeague.allTeams.map((team, index) => {
    const { id, name, division } = team;
    teamIdToIndex[id] = index;

    const teamObj: TeamStandings = {
      id,
      name,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      totalScored: 0,
      endsWon: 0,
      highEnd: 0,
      recordVsOtherTeams: {},
    };

    if (division) {
      if (divisions[division]) {
        divisions[division].push(teamObj);
      } else {
        divisions[division] = [teamObj];
      }
    }

    return teamObj;
  });

  type AllLeaguesRecord = Record<'allLeagues', Array<AllLeaguesQuery>>;

  // Get all weeks/games/ends from a league
  const league: AllLeaguesRecord = await context.graphql.run({
    query: graphql`
      query LEAGUE_WEEKS_QUERY($leagueSlug: ID!) {
        allLeagues(where: { slug: $leagueSlug }) {
          numRegSeasonWeeks
          games {
            topTeam {
              id
            }
            bottomTeam {
              id
            }
            ends {
              number
              scoringTeam
              score
            }
            weekInteger
          }
        }
      }
    `,
    variables: {
      leagueSlug,
    },
  });

  const { numRegSeasonWeeks, games } = league.allLeagues[0];

  games.forEach((game) => {
    const { topTeam, bottomTeam, ends, weekInteger } = game;

    // Don't count playoff weeks
    if (weekInteger > numRegSeasonWeeks) {
      return;
    }

    // Don't count games with no ends
    if (!ends.length) {
      return;
    }

    const { id: topTeamId } = topTeam;
    const { id: bottomTeamId } = bottomTeam;

    // Initialize Game
    let topTeamScore = 0;
    let bottomTeamScore = 0;
    const topTeamObj = teams[teamIdToIndex[topTeamId]];
    const bottomTeamObj = teams[teamIdToIndex[bottomTeamId]];
    topTeamObj.gamesPlayed += 1;
    bottomTeamObj.gamesPlayed += 1;

    ends.forEach((end, endIndex) => {
      const { score, scoringTeam } = end;
      const isLastEnd = endIndex === ends.length - 1;

      updateTeamStats(score, scoringTeam, topTeamObj, bottomTeamObj);
      if (scoringTeam === 'TOP') {
        topTeamScore += score;
      } else {
        bottomTeamScore += score;
      }

      if (isLastEnd) {
        updateTeamRecords({
          topTeamObj,
          bottomTeamObj,
          topTeamScore,
          bottomTeamScore,
        });
      }
    });
  });

  teams.sort(standingsSort);

  Object.keys(divisions).forEach((division) => {
    divisions[division].sort(standingsSort);
  });

  return {
    teams,
    divisions,
  };
}
