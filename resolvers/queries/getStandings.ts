import { KeystoneContext } from '@keystone-next/types';
// TODO: Type the hell out of this file
// import { Session } from '../types';

const graphql = String.raw; // fake template literal

const POINTS_FOR_WIN = 2;
const POINTS_FOR_DRAW = 1;

/**
 * Update `endsWon`, `totalScored` and `highEnd` for the teams involved in a game
 * @param {Number} score
 * @param {String} scoring_team 'top|bottom'
 * @param {*} topTeamObj
 * @param {*} bottomTeamObj
 */
const updateTeamStats = (score, scoring_team, topTeamObj, bottomTeamObj) => {
  if (score > 0) {
    const scoringTeamObj = scoring_team === 'TOP' ? topTeamObj : bottomTeamObj;
    scoringTeamObj.endsWon++;
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
    topTeamObj.wins++;
    topTeamObj.points += POINTS_FOR_WIN;
    topTeamObj.recordVsOtherTeams[bottomTeamObj.id].wins++;
    bottomTeamObj.losses++;
    bottomTeamObj.recordVsOtherTeams[topTeamObj.id].losses++;
  } else if (bottomTeamScore > topTeamScore) {
    bottomTeamObj.wins++;
    bottomTeamObj.points += POINTS_FOR_WIN;
    bottomTeamObj.recordVsOtherTeams[topTeamObj.id].wins++;
    topTeamObj.losses++;
    topTeamObj.recordVsOtherTeams[bottomTeamObj.id].losses++;
  } else {
    // tie
    bottomTeamObj.draws++;
    bottomTeamObj.points += POINTS_FOR_DRAW;
    bottomTeamObj.recordVsOtherTeams[topTeamObj.id].draws++;
    topTeamObj.draws++;
    topTeamObj.points += POINTS_FOR_DRAW;
    topTeamObj.recordVsOtherTeams[bottomTeamObj.id].draws++;
  }
};

// Sorting / tiebreakers
const standingsSort = (teamA, teamB) => {
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
  root: any,
  { leagueSlug }: { leagueSlug: string },
  context: KeystoneContext
): Promise<{ teams: any; divisions: any }> {
  // 1. TODO: query current user, see if signed in
  //   const session = context.session as Session;
  //   if (!session.itemId) {
  //     throw new Error('You must be logged in to do this');
  //   }

  const divisions = {};
  const teamIdToIndex = {};

  // Get all teams in a league
  const teamsByLeague = await context.graphql.run({
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
    const {
      id,
      name,
      division,
    }: { id: string; name: string; division: string } = team;
    teamIdToIndex[id] = index;

    const teamObj = {
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

  // Get all weeks/games/ends from a league
  const league = await context.graphql.run({
    query: graphql`
      query LEAGUE_WEEKS_QUERY($leagueSlug: ID!) {
        allLeagues(where: { slug: $leagueSlug }) {
          # allWeeks(where: { league: { slug: $leagueSlug } }) {
          numRegSeasonWeeks
          weeks {
            number
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
            }
          }
        }
      }
    `,
    variables: {
      leagueSlug,
    },
  });

  const { numRegSeasonWeeks, weeks } = league.allLeagues[0];

  weeks.forEach((week) => {
    const { games, number } = week;

    // Don't count playoff weeks
    if (number > numRegSeasonWeeks) {
      return;
    }

    games.forEach((game) => {
      const { topTeam, bottomTeam, ends } = game;

      // Don't count games with no ends
      if (!ends.length) {
        return;
      }

      const { id: top_team } = topTeam;
      const { id: bottom_team } = bottomTeam;

      // Initialize Game
      let topTeamScore = 0;
      let bottomTeamScore = 0;
      const topTeamObj = teams[teamIdToIndex[top_team]];
      const bottomTeamObj = teams[teamIdToIndex[bottom_team]];
      topTeamObj.gamesPlayed++;
      bottomTeamObj.gamesPlayed++;

      ends.forEach((end, endIndex) => {
        const { score, scoringTeam: scoring_team } = end;
        const isLastEnd = endIndex === ends.length - 1;

        updateTeamStats(score, scoring_team, topTeamObj, bottomTeamObj);
        scoring_team === 'TOP'
          ? (topTeamScore += score)
          : (bottomTeamScore += score);

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
