import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import submitScore from './submitScore';

// fake graphql tagged template literal
const graphql = String.raw;

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: graphql`
    type Mutation {
      submitScore(gameId: ID!, gameData: JSON!, userName: String!): Game
    }
  `,
  resolvers: {
    Mutation: {
      submitScore,
    },
  },
});
