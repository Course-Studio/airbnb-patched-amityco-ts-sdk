import { getActiveClient } from '~/client';
import { COLLECTION_DEFAULT_CACHING_POLICY, ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache, pullFromCache, pushToCache } from '~/cache/api';
import { createQuery, queryOptions, runQuery } from '~/core/query';
import { CACHE_SHORTEN_LIFESPAN } from '~/cache/utils';
import { queryReachUser } from '~/analytic/api/queryReachUser';

export const getReachedUsers = (
  params: Amity.ViewedUsersLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.User | undefined>,
): Amity.Unsubscriber => {
  // Pre-defined function to avoid undefined function call
  let onFetch = (initial = false): void => undefined;

  const { log, cache } = getActiveClient();
  const cacheKey = [
    'viewedUsers',
    'collection',
    { viewId: params.viewId, viewedType: params.viewedType },
  ];

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getReachUsers(tmpid: ${timestamp}) > listen`);

  const { limit: queryLimit, viewId, viewedType } = params;

  const responder = (snapshot: {
    loading?: boolean;
    params?: { page: { next: Amity.Token; previous?: Amity.Token } };
    data: Amity.User['userId'][];
  }) => {
    let users: (Amity.User | undefined)[] = [];

    if (snapshot?.data) {
      users =
        snapshot.data
          .map((userId: Amity.User['userId']) => pullFromCache<Amity.User>(['user', 'get', userId]))
          .filter(Boolean)
          .map(data => data?.data) || [];
    }

    callback({
      onNextPage: onFetch,
      data: users,
      hasNextPage: !!snapshot.params?.page?.next,
      loading: snapshot.loading || false,
    });
  };

  onFetch = (initial = false) => {
    const collection = pullFromCache<Amity.PostViewedUsersLiveCollectionCache>(cacheKey)?.data;

    const users = collection?.data ?? [];

    if (!initial && users.length > 0 && !collection?.params.page) return;

    const query = createQuery(queryReachUser, {
      viewId,
      viewedType,
      limit: queryLimit || 10,
      token: !initial ? collection?.params.page?.next : undefined,
    });

    runQuery(
      query,
      result => {
        let userIds =
          pullFromCache<Amity.PostViewedUsersLiveCollectionCache>(cacheKey)?.data?.data ?? [];

        if (result.data?.users) {
          userIds = [
            ...new Set([...userIds, ...result.data.users.map(({ userId }: Amity.User) => userId)]),
          ];
        }

        const saveToCache = {
          loading: result.loading,
          params: { page: result.data?.paging },
          data: userIds || [],
        };

        pushToCache(cacheKey, saveToCache);

        responder(saveToCache);
      },
      queryOptions(COLLECTION_DEFAULT_CACHING_POLICY, CACHE_SHORTEN_LIFESPAN),
    );
  };

  onFetch(true);

  return () => {
    log(`getReachUsers(tmpid: ${timestamp}) > dispose`);
    dropFromCache(cacheKey);
  };
};
