import { getResolver } from '~/core/model';

import { disableCache, enableCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import {
  client,
  channelUserQueryResponse,
  channelUserModel,
  convertRawChannelPayload,
  connectClient,
  disconnectClient,
} from '~/utils/tests';

import { queryChannelMembers } from '../queryChannelMembers';

describe('queryChannelMembers', () => {
  beforeEach(disableCache);
  beforeAll(connectClient);
  afterAll(disconnectClient);

  const { channelId } = channelUserQueryResponse.data.channels[0];

  // integration_test_id: 1e5a4b11-a7f3-496e-a594-22b10ed28a20
  test('it should return channel members', async () => {
    const expected = channelUserQueryResponse.data.channelUsers;
    client.http.get = jest.fn().mockResolvedValue(channelUserQueryResponse);

    const { data } = await queryChannelMembers({ channelId });
    expect(data).toEqual(expected);
  });

  test('it should return channel members by attaching a user', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(channelUserQueryResponse);

    const { data } = await queryChannelMembers({ channelId });

    expect(data).toEqual(channelUserModel);

    disableCache();
  });

  test('it should throw error', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(queryChannelMembers({ channelId })).rejects.toThrow('error');
  });

  test('it should update cache upon fetching data from server', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(channelUserQueryResponse);

    const { data: got } = await queryChannelMembers({ channelId });
    const { data } = queryChannelMembers.locally({ channelId })!;

    expect(data).toBeDefined();
    expect(got).toEqual(data);

    disableCache();
  });
});

describe('queryChannelMembers.locally', () => {
  const { channelId } = channelUserQueryResponse.data.channels[0];
  const cacheKey = [
    'channelUsers',
    'query',
    { channelId, options: { limit: 10, after: undefined } },
  ];

  test('it should fetch query locally if present in cache', () => {
    enableCache();

    const { paging, ...payload } = channelUserQueryResponse.data;
    const preparedPayload = convertRawChannelPayload(payload);
    const { channelUsers } = preparedPayload;

    ingestInCache(preparedPayload);

    pushToCache(cacheKey, {
      channelUsers: channelUsers.map(({ channelId, userId }) =>
        getResolver('channelUsers')({ channelId, userId }),
      ),
      paging,
    });

    const got = queryChannelMembers.locally({
      channelId,
      page: { limit: 10, after: undefined },
    })?.data;

    expect(got).toBeDefined();
    expect(got).toEqual(channelUsers);

    disableCache();
  });

  test('it should return undefined if only partial data in cache', () => {
    enableCache();

    const { paging, ...payload } = channelUserQueryResponse.data;
    const preparedPayload = convertRawChannelPayload(payload);
    const { channelUsers } = preparedPayload;

    // ingest incomplete data
    ingestInCache({
      ...preparedPayload,
      channelUsers: [preparedPayload.channelUsers[0]],
    });

    pushToCache(cacheKey, {
      channelUsers: channelUsers.map(({ channelId, userId }) =>
        getResolver('channelUsers')({ channelId, userId }),
      ),
      paging,
    });

    const got = queryChannelMembers.locally({ channelId })!;

    expect(got).toBeUndefined();

    disableCache();
  });

  test('it should return undefined if data not in cache', () => {
    enableCache();

    const got = queryChannelMembers.locally({ channelId });

    expect(got).toBeUndefined();

    disableCache();
  });

  test('it should return undefined if cache disabled', () => {
    expect(queryChannelMembers.locally({ channelId })).toBeUndefined();
  });
});
