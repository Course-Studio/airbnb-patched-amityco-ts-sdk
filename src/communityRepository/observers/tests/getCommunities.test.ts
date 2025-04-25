import { disableCache, enableCache } from '~/cache/api';
import {
  communityQueryResponse,
  communityQueryResponsePage2,
  client,
  connectClient,
  disconnectClient,
  pause,
  communityUser11,
  emptyCommunityPayload,
} from '~/utils/tests';

import { getCommunities } from '../getCommunities';
import { prepareCommunityPayload } from '../../utils';

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.Community[],
    loading: true,
    error: undefined as any,
    ...params,
  };
};

const { paging, ...payload } = communityQueryResponse.data;

const community1 = prepareCommunityPayload(payload).communities[0];
const community2 = prepareCommunityPayload(payload).communities[1];

describe('getCommunities', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);

  afterEach(disableCache);

  test('it should return community collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(communityQueryResponse);

    getCommunities({ includeDeleted: true }, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({
          data: prepareCommunityPayload(payload).communities,
          loading: false,
        }),
      ),
    );
  });

  test('it should return data from cache', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(communityQueryResponse);

    getCommunities({ includeDeleted: true }, () => undefined);
    await pause();
    getCommunities({ includeDeleted: true }, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining(
        getSnapshot({
          data: prepareCommunityPayload(payload).communities,
        }),
      ),
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({
          data: prepareCommunityPayload(payload).communities,
          loading: false,
        }),
      ),
    );
  });

  const filters: [string, Amity.CommunityLiveCollection, Amity.Community[]][] = [
    ['not deleted', { includeDeleted: false }, [community2]],
    ['categoryId', { categoryId: 'test-category-id', includeDeleted: true }, [community1]],
    ['tagged', { tags: ['test-community-tag'], includeDeleted: true }, [community1]],
  ];

  test.each(filters)('it should filter by %s communities', async (filter, params, expected) => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(communityQueryResponse);

    getCommunities(params, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    // check if cache data returned (should be empty)
    expect(callback).toHaveBeenCalledWith(expect.objectContaining(getSnapshot()));

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: expected,
        }),
      ),
    );
  });

  test('it should return method to fetch next page', async () => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue(communityQueryResponse)
      .mockResolvedValueOnce(communityQueryResponsePage2);

    getCommunities({ includeDeleted: true }, callback);
    await pause();

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.lastCall).toHaveLength(1);

    const { onNextPage, hasNextPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    onNextPage();
    await pause();

    // 4 -> because 1 local & server call each per call (2)
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: prepareCommunityPayload(payload).communities,
        }),
      ),
    );
  });

  describe('events', () => {
    const newCommunityPayload = {
      ...communityQueryResponse.data.communities[0],
      communityId: 'new-community',
      isDeleted: false,
    };

    const newCommunity = prepareCommunityPayload({
      ...emptyCommunityPayload,
      communities: [newCommunityPayload],
    }).communities[0];

    const communityPayload = {
      ...emptyCommunityPayload,
      communities: [communityQueryResponse.data.communities[0]],
      communityUsers: [communityUser11],
    };

    const cases: [string, keyof Amity.Events, Amity.CommunityPayload, Amity.Community[]][] = [
      [
        'it should add new community to collection onCreate',
        'community.created',
        {
          ...emptyCommunityPayload,
          communities: [newCommunityPayload],
        },
        [newCommunity, community2],
      ],
      [
        'it should update community in collection onUpdate',
        'community.updated',
        {
          ...emptyCommunityPayload,
          communities: [{ ...newCommunityPayload, communityId: community1.communityId }],
        },
        [{ ...newCommunity, communityId: community1.communityId }, community2],
      ],
      [
        'it should remove community from collection onDelete',
        'community.deleted',
        communityPayload,
        [community2],
      ],
    ];

    test.each(cases)('%s', async (test, event, communityPayload, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(communityQueryResponse);

      getCommunities({ includeDeleted: false }, callback);
      await pause();

      client.emitter.emit(event, communityPayload);
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining(
          getSnapshot({
            data: expected,
            loading: false,
          }),
        ),
      );
    });
  });
});
