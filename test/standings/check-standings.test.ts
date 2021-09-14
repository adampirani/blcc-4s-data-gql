/** Used an export of rest data & gql data
 * Iterate over leagues, games, ends to make sure content & order matches
 *
 * Issues found: commas in team names broke csv export / import process
 *
 */

import * as restData2019_f_s_e from './rest/2019-f-s-e.json';
import * as restData2019_f_s_l from './rest/2019-f-s-l.json';
import * as restData2019_f_w from './rest/2019-f-w.json';
import * as restData2020_f_s from './rest/2020-f-s.json';
import * as restData2020_f_w from './rest/2020-f-w.json';
import * as restData2020_w_s_e from './rest/2020-w-s-e.json';
import * as restData2020_w_s_l from './rest/2020-w-s-l.json';
import * as restData2020_w_w from './rest/2020-w-w.json';
import * as restData2021_w_s from './rest/2021-w-s.json';
import * as restData2021_w_w from './rest/2021-w-w.json';

import * as gqlData019_f_s_e from './gql/2019-f-s-e.json';
import * as gqlData019_f_s_l from './gql/2019-f-s-l.json';
import * as gqlData019_f_w from './gql/2019-f-w.json';
import * as gqlData020_f_s from './gql/2020-f-s.json';
import * as gqlData020_f_w from './gql/2020-f-w.json';
import * as gqlData020_w_s_e from './gql/2020-w-s-e.json';
import * as gqlData020_w_s_l from './gql/2020-w-s-l.json';
import * as gqlData020_w_w from './gql/2020-w-w.json';
import * as gqlData021_w_s from './gql/2021-w-s.json';
import * as gqlData021_w_w from './gql/2021-w-w.json';

const restData = {
  '2019-f-s-e': restData2019_f_s_e,
  '2019-f-s-l': restData2019_f_s_l,
  '2019-f-w': restData2019_f_w,
  '2020-f-s': restData2020_f_s,
  '2020-f-w': restData2020_f_w,
  '2020-w-s-e': restData2020_w_s_e,
  '2020-w-s-l': restData2020_w_s_l,
  '2020-w-w': restData2020_w_w,
  '2021-w-s': restData2021_w_s,
  '2021-w-w': restData2021_w_w,
};

const gqlData = {
  '2019-f-s-e': gqlData019_f_s_e,
  '2019-f-s-l': gqlData019_f_s_l,
  '2019-f-w': gqlData019_f_w,
  '2020-f-s': gqlData020_f_s,
  '2020-f-w': gqlData020_f_w,
  '2020-w-s-e': gqlData020_w_s_e,
  '2020-w-s-l': gqlData020_w_s_l,
  '2020-w-w': gqlData020_w_w,
  '2021-w-s': gqlData021_w_s,
  '2021-w-w': gqlData021_w_w,
};

const checkTeams = (restTeam, gqlTeam) => {
  const {
    name: restName,
    gamesPlayed: restGamesPlayed,
    wins: restWins,
    losses: restLosses,
    draws: restDraws,
    points: restPoints,
    totalScored: restTotalScored,
    endsWon: restEndsWon,
    highEnd: restHighEnd,
  } = restTeam;

  const {
    name: gqlName,
    gamesPlayed: gqlGamesPlayed,
    wins: gqlWins,
    losses: gqlLosses,
    draws: gqlDraws,
    points: gqlPoints,
    totalScored: gqlTotalScored,
    endsWon: gqlEndsWon,
    highEnd: gqlHighEnd,
  } = gqlTeam;

  expect(restName).toEqual(gqlName);
  expect(restGamesPlayed).toEqual(gqlGamesPlayed);
  expect(restWins).toEqual(gqlWins);
  expect(restLosses).toEqual(gqlLosses);
  expect(restDraws).toEqual(gqlDraws);
  expect(restPoints).toEqual(gqlPoints);
  expect(restTotalScored).toEqual(gqlTotalScored);
  expect(restEndsWon).toEqual(gqlEndsWon);
  expect(restHighEnd).toEqual(gqlHighEnd);
};

test('Check league data', () => {
  for (const league of Object.keys(restData)) {
    const restStandingsData = restData[league];
    const gqlStandingsData = gqlData[league].data.getStandings;

    const { divisions: restDivisions, teams: restTeams } = restStandingsData;
    const { divisions: gqlDivisions, teams: gqlTeams } = gqlStandingsData;

    expect(restTeams.count).toEqual(gqlTeams.count);

    restTeams.forEach((restTeam, idx) => {
      const gqlTeam = gqlTeams[idx];
      checkTeams(restTeam, gqlTeam);
    });

    expect(Object.keys(gqlDivisions).length).toEqual(
      Object.keys(restDivisions).length
    );

    Object.keys(gqlDivisions).forEach((divisionName) => {
      const restDivision = restDivisions[divisionName];
      const gqlDivision = gqlDivisions[divisionName];

      restDivision.forEach((restTeam, idx) => {
        const gqlTeam = gqlDivision[idx];
        checkTeams(restTeam, gqlTeam);
      });
    });
  }
});
