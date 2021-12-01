import { integer, relationship, text, virtual } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const Substitution = list({
  fields: {
    label: virtual({
      graphQLReturnType: 'String',
      async resolver(
        sub: { spot: number; game: string; team: string; league: string },
        __,
        context
      ) {
        const { mongoose } = context;
        const { spot, game, team, league } = sub;

        const gameObject = await mongoose.model('Game').findById(game).exec();
        const { week } = gameObject;
        const teamObject = await mongoose.model('Team').findById(team).exec();
        const weekObject = await mongoose.model('Week').findById(week).exec();
        const leagueObject = await mongoose
          .model('League')
          .findById(league)
          .exec();

        return `${leagueObject.name} | ${teamObject.name} | Wk ${weekObject.number} | Spot ${spot}`;
      },
    }),
    league: relationship({
      ref: 'League',
    }),
    team: relationship({
      ref: 'Team',
    }),
    game: relationship({
      ref: 'Game',
    }),
    spot: integer({
      isRequired: true,
    }),
    requestorEmail: text(),
    subName: text(),
    subEmail: text(),
  },
  ui: {
    listView: {
      initialColumns: ['label', 'league', 'spot', 'subName'],
    },
  },
});
