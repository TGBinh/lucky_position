import { readFileSync } from 'fs';
import { gql } from 'apollo-server-express';

const schemaFile = readFileSync('./schema.graphql', { encoding: 'utf-8' });

export const typeDefs = gql`${schemaFile}`;
