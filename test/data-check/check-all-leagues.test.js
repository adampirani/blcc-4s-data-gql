/** Used an export of rest data & gql data
 * Iterate over leagues, games, ends to make sure content & order matches
 *
 * Issues found: commas in team names broke csv export / import process
 */

const fs = require('fs');
const gqlData = require('./gql/all.json');

test('Check league data', () => {
  gqlData.data.allLeagues.forEach((league) => {
    const { name, slug, weeks } = league;

    const restLeagueData = require(`./rest/${slug}.json`);

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
  });
});
