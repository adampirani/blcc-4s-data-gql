# blcc-4s-data-gql

GraphQL implementation of BLCC's curling scores backend.
Uses KeystoneJS (GraphQL CMS with Typescript & NextJS), based off of lessons in [Wes Bos's Advanced React Course](https://advancedreact.com/).

App is live at https://curlingscores.api.adampirani.info/

This powers the score system for Brooklyn Lakeside Curling Club, managing leagues, teams, scores and schedules.

## Local Development

Use node version in [package.json](https://github.dev/adampirani/blcc-4s-data-gql/blob/72cb50c2c4802011928ece55059efd69a77f1be5/package.json) engines (>=14.0.0 at the time of this commit)

```sh
npm i
npm run dev
```

### .env file

Please contact me for the minimum env variables required to run this.

## Upgrading Keystone Version

This project currently uses a MongoDB database and the "mongoose" which has been deprecated by Keystone (as of ~v15.0.0). Mongo will be supported once Prisma is integrated (currently in a [preview release](https://www.prisma.io/blog/prisma-mongodb-preview-release))
