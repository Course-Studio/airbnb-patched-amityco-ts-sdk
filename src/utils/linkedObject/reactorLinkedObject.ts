import { pullFromCache } from '~/cache/api/pullFromCache';
import { userLinkedObject } from './userLinkedObject';

export const reactorLinkedObject = (reactor: Amity.InternalReactor): Amity.Reactor => {
  return {
    ...reactor,
    get user(): Amity.User | undefined {
      const user = pullFromCache<Amity.InternalUser>(['user', 'get', reactor.userId])?.data;
      if (!user) return undefined;
      return userLinkedObject(user);
    },
  };
};
