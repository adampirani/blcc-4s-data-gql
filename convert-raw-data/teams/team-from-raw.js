/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const currentDir = process.cwd();

const LEAGUE_SLUG = '2022-w-s';

fs.readFile(`${currentDir}/${LEAGUE_SLUG}`, 'utf8', (err, data) => {
  const divisions = ['Parkside', 'Ocean'];

  const teams = data
    .toString()
    .split('\n')
    .map((line, index) => ({
      league: LEAGUE_SLUG,
      number: index + 1,
      slug: `${LEAGUE_SLUG}-${index + 1}`,
      name: line.split(' - ')[1],
      division: divisions[Math.floor(index / 5)],
      // division: '',
    }));

  console.log(teams.splice(0, teams.length - 1));
});
