/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const currentDir = process.cwd();

const LEAGUE_SLUG = '2022-w-w-l';

const WEEK_DATES = {
  '2022-w-s': {
    1: '2022-01-23T22:30:00.000Z',
    2: '2022-01-30T22:30:00.000Z',
    3: '2022-02-06T22:30:00.000Z',
    4: '2022-02-20T22:30:00.000Z',
    5: '2022-02-27T22:30:00.000Z',
  },
  '2022-w-w-e': {
    1: '2022-01-19T23:30:00.000Z',
    2: '2022-01-26T23:30:00.000Z',
    3: '2022-02-02T23:30:00.000Z',
    4: '2022-02-16T23:30:00.000Z',
    5: '2022-02-23T23:30:00.000Z',
  },
  '2022-w-w-l': {
    1: '2022-01-20T01:30:00.000Z',
    2: '2022-01-27T01:30:00.000Z',
    3: '2022-02-03T01:30:00.000Z',
    4: '2022-02-17T01:30:00.000Z',
    5: '2022-02-24T01:30:00.000Z',
    6: '2022-03-03T01:30:00.000Z',
  },
};

fs.readFile(`${currentDir}/${LEAGUE_SLUG}`, 'utf8', (err, data) => {
  const games = [];
  let weekNum = 0;

  data
    .toString()
    .split('\n')
    .forEach((line) => {
      if (line === '') {
        return;
      }

      if (line.startsWith('Week')) {
        weekNum += 1;
      } else if (line.startsWith('Sheet')) {
        const lineByDashes = line.split(' - ');
        const sheet = Number(lineByDashes[0].split(' ')[1]);
        const topTeamNum = lineByDashes[1].split('Team ')[1];
        const bottomTeamNum = lineByDashes[2].split('Team ')[1];

        games.push({
          league: LEAGUE_SLUG,
          week: weekNum,
          weekDate: WEEK_DATES[LEAGUE_SLUG][weekNum],
          sheet,
          slug: `${LEAGUE_SLUG}-${weekNum}-${sheet}`,
          topTeam: `${LEAGUE_SLUG}-${topTeamNum}`,
          bottomTeam: `${LEAGUE_SLUG}-${bottomTeamNum}`,
          dateSubmitted: '',
          submittedBy: '',
        });
      }
    });
  console.log(games);
});
