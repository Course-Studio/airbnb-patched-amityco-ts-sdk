import { getResolver } from '~/core/model';

import { disableCache, enableCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareMembershipPayload } from '~/group/utils';

import { client, communityUserModel, communityUserQueryResponse } from '~/utils/tests';

import { queryCommunityMembers } from '../queryCommunityMembers';

describe('queryCommunityMembers', () => {
  const { communityId } = communityUserQueryResponse.data.communities[0];
  beforeEach(disableCache);

  test('it should return community members', async () => {
    const expected = communityUserQueryResponse.data.communityUsers;
    client.http.get = jest.fn().mockResolvedValue(communityUserQueryResponse);

    const { data: received } = await queryCommunityMembers({ communityId });

    expect(received).toEqual(expected);
  });

  test('it should return community members and attach the user', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(communityUserQueryResponse);

    const { data: received } = await queryCommunityMembers({ communityId });

    expect(received).toEqual(communityUserModel);

    disableCache();
  });

  test('it should throw error', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(queryCommunityMembers({ communityId })).rejects.toThrow('error');
  });

  test('it should update cache upon fetching data from server', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(communityUserQueryResponse);

    const { data: received } = await queryCommunityMembers({ communityId });
    const cache = queryCommunityMembers.locally({ communityId })?.data;

    expect(cache).toBeDefined();
    expect(received).toEqual(cache);

    disableCache();
  });
});

describe('queryCommunityMembers.locally', () => {
  const { communityId } = communityUserQueryResponse.data.communities[0];
  const cacheKey = ['communityUsers', 'query', { communityId, options: {} }];

  test('it should fetch query locally if present in cache', () => {
    enableCache();

    const { paging, ...payload } = communityUserQueryResponse.data;
    const preparedPayload = prepareMembershipPayload(payload, 'communityUsers');
    const { communityUsers } = preparedPayload;

    ingestInCache(preparedPayload);

    pushToCache(cacheKey, {
      communityUsers: communityUsers.map(({ communityId, userId }) =>
        getResolver('communityUsers')({ communityId, userId }),
      ),
      paging,
    });

    const received = queryCommunityMembers.locally({ communityId })?.data;

    expect(received).toBeDefined();
    expect(received).toEqual(communityUserModel);

    disableCache();
  });

  test('it should return undefined if only partial data in cache', () => {
    enableCache();

    const { paging, ...payload } = communityUserQueryResponse.data;
    const preparedPayload = prepareMembershipPayload(payload, 'communityUsers');
    const { communityUsers } = preparedPayload;

    // ingest incomplete data
    // @ts-ignore
    ingestInCache({
      ...preparedPayload,
      communityUsers: [payload.communityUsers[0]],
    } as Amity.ProcessedCommunityMembershipPayload);

    pushToCache(cacheKey, {
      communityUsers: communityUsers.map(({ communityId, userId }) =>
        getResolver('communityUsers')({ communityId, userId }),
      ),
      paging,
    });

    const received = queryCommunityMembers.locally({ communityId })!;

    expect(received).toBeUndefined();

    disableCache();
  });

  test('it should return undefined if data not in cache', () => {
    enableCache();

    const received = queryCommunityMembers.locally({ communityId });

    expect(received).toBeUndefined();

    disableCache();
  });

  test('it should return undefined if cache disabled', () => {
    expect(queryCommunityMembers.locally({ communityId })).toBeUndefined();
  });
});
