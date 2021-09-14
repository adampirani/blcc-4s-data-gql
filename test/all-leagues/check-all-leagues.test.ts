/** Used an export of rest data & gql data
 * Iterate over leagues, games, ends to make sure content & order matches
 *
 * Issues found: commas in team names broke csv export / import process
 *
 */

import fs from 'fs';
import * as gqlData from './gql/all.json';

import * as data2019_f_s_e from './rest/2019-f-s-e.json';
import * as data2019_f_s_l from './rest/2019-f-s-l.json';
import * as data2019_f_w from './rest/2019-f-w.json';
import * as data2020_f_s from './rest/2020-f-s.json';
import * as data2020_f_w from './rest/2020-f-w.json';
import * as data2020_w_s_e from './rest/2020-w-s-e.json';
import * as data2020_w_s_l from './rest/2020-w-s-l.json';
import * as data2020_w_w from './rest/2020-w-w.json';
import * as data2021_w_s from './rest/2021-w-s.json';
import * as data2021_w_w from './rest/2021-w-w.json';

const restData = {
  '2019-f-s-e': data2019_f_s_e,
  '2019-f-s-l': data2019_f_s_l,
  '2019-f-w': data2019_f_w,
  '2020-f-s': data2020_f_s,
  '2020-f-w': data2020_f_w,
  '2020-w-s-e': data2020_w_s_e,
  '2020-w-s-l': data2020_w_s_l,
  '2020-w-w': data2020_w_w,
  '2021-w-s': data2021_w_s,
  '2021-w-w': data2021_w_w,
};

test('Check league data', async () => {
  for (const league of gqlData.data.allLeagues) {
    const { name, slug, weeks } = league;

    const restLeagueData = restData[slug];

    const { league: restLeague, weeks: restWeeks } = restLeagueData;
    const { name: restName, id: restSlug } = restLeague;

    expect(name).toEqual(restName);
    expect(slug).toEqual(restSlug);
    expect(weeks.count).toEqual(restWeeks.count);

    weeks.forEach((week, idx) => {
      const restWeek = restWeeks[idx];

      const { number, games } = week;
      const { week: restNumber, games: restGames } = restWeek;

      expect(number).toEqual(restNumber);
      expect(games.count).toEqual(restGames.count);

      games.forEach((game, idx) => {
        const restGame = restGames[idx];

        const { sheet, slug, topTeam, bottomTeam, ends } = game;
        const {
          sheet: restSheet,
          id: restSlug,
          teams,
          ends: restEnds,
        } = restGame;
        const { top: restTopTeam, bottom: restBottomTeam } = teams;

        expect(sheet).toEqual(restSheet);
        expect(slug).toEqual(restSlug);
        expect(topTeam.slug).toEqual(restTopTeam.id);
        expect(topTeam.name).toEqual(restTopTeam.name);
        expect(bottomTeam.slug).toEqual(restBottomTeam.id);
        expect(bottomTeam.name).toEqual(restBottomTeam.name);
        expect(ends.count).toEqual(restEnds.count);

        ends.forEach((end, idx) => {
          const restEnd = restEnds[idx];
          const { scoringTeam, score } = end;
          const { scoringTeam: restScoringTeam, score: restScore } = restEnd;

          expect(score).toEqual(restScore);
          if (score === 0) {
            expect(scoringTeam).toEqual('BLANK');
          } else {
            expect(scoringTeam).toEqual(restScoringTeam.toUpperCase());
          }
        });
      });
    });
  }
});
