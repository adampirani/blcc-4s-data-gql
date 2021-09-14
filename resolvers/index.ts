import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import submitScore from './mutations/submitScore';
import getStandings from './queries/getStandings';

// fake graphql tagged template literal
const graphql = String.raw;

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: graphql`
    type Mutation {
      submitScore(gameId: ID!, gameData: JSON!, userName: String!): Game
    }
    type Query {
      getStandings(leagueSlug: String!): JSON
    }
  `,
  resolvers: {
    Mutation: {
      submitScore,
    },
    Query: {
      getStandings,
    },
  },
});
