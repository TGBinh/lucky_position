import { Game } from './model';

export const resolvers = {
  Query: {
    games: async ({ limit = 10, offset = 0 }, { store }: { store: any }) => {
      const games = await store.get(Game, { limit, offset });
      const totalCount = await store.count(Game);
      const totalPages = Math.ceil(totalCount / limit);
      return { games, totalPages };
    },
  },
};
