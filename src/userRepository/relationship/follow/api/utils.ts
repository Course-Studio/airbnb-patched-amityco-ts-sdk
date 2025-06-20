import { getActiveClient } from '~/client/api';
import { toPageRaw, toToken } from '~/core/query';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getResolver } from '~/core/model';
import { prepareFollowersPayload } from '../utils';

export const queryFollows = async (
  key: 'followers' | 'following',
  query: {
    userId: Amity.InternalUser['userId'];
    status?: Exclude<Amity.FollowStatusType, 'none'>;
    page?: Amity.PageRaw;
  },
): Promise<Amity.Cached<Amity.Paged<Amity.FollowStatus, Amity.PageRaw>>> => {
  const client = getActiveClient();
  client.log(`follow/queryF${key.substring(1)}`, query);

  const { userId, page, ...params } = query;

  const { data } = await client.http.get<Amity.FollowersPayload & Amity.Pagination>(
    client.userId === userId ? `/api/v4/me/${key}` : `/api/v4/users/${userId}/${key}`,
    {
      params: {
        ...params,
        token: toToken(page, 'afterbeforeraw'),
      },
    },
  );

  const { paging, ...payload } = data;

  const cachedAt = client.cache && Date.now();

  const preparedPayload = prepareFollowersPayload(payload);

  const { follows } = preparedPayload;

  if (client.cache) {
    ingestInCache(preparedPayload, { cachedAt });

    const cacheKey = [
      'follow',
      'query',
      { ...params, userId, options: { ...page }, type: key } as Amity.Serializable,
    ];
    pushToCache(cacheKey, { follows: follows.map(getResolver('follow')), paging });
  }

  const nextPage = toPageRaw(paging.next);
  const prevPage = toPageRaw(paging.previous);

  return { data: follows, cachedAt, prevPage, nextPage };
};

queryFollows.locally = (
  key: Parameters<typeof queryFollows>[0],
  query: Parameters<typeof queryFollows>[1],
): Amity.Cached<Amity.Paged<Amity.FollowStatus, Amity.PageRaw>> | undefined => {
  const client = getActiveClient();
  client.log(`follow/queryF${key.substring(1)}.locally`, query);

  if (!client.cache) return;

  const { page, ...params } = query;

  const queryKey = [
    'follow',
    'query',
    { ...params, options: { ...page }, type: key } as Amity.Serializable,
  ];
  const { data, cachedAt } =
    pullFromCache<{ follows: string[] } & Amity.Pagination>(queryKey) ?? {};

  if (!data?.follows.length) {
    return;
  }

  const follows: Amity.FollowStatus[] = data.follows
    .map(key => pullFromCache<Amity.FollowStatus>(['follow', 'get', key])!)
    .filter(Boolean)
    .map(({ data }) => data);

  const prevPage = toPageRaw(data?.paging.previous);
  const nextPage = toPageRaw(data?.paging.next);

  return follows.length === data?.follows?.length
    ? { data: follows, cachedAt, prevPage, nextPage }
    : undefined;
};
