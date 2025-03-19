import "reflect-metadata";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { gql } from 'apollo-server-express';
import { resolvers } from "./resolvers";

const schemaFile = readFileSync('./src/schema.graphql', { encoding: 'utf-8' });
const typeDefs = gql`${schemaFile}`;

async function startGraphQLServer() {
  const app = express();

  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  const port = parseInt(process.env.PORT || "3000", 10);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(port, '0.0.0.0', () => {
    console.log(`GraphQL endpoint running at http://0.0.0.0:${port}/graphql`);
  });
}

startGraphQLServer();
