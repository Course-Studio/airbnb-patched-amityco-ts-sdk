import { disableCache, enableCache } from '~/cache/api';
import {
  channel1,
  channel2,
  channelQueryResponse,
  channelQueryResponsePage2,
  channelRaw1,
  channelRaw2,
  client,
  connectClient,
  convertRawChannelPayload,
  convertChannelFromRaw,
  disconnectClient,
  generateRawChannel,
  generateRawMessage,
  mockPage,
  pause,
  rawChannelUser,
  rawChannelUser2,
  user11,
  channelDisplayName3,
  channelDisplayName2,
  channelDisplayName1,
  channelCreatedAt3,
  channelCreatedAt2,
  channelCreatedAt1,
  channelLastActivity1,
  channelLastActivity2,
  channelLastActivity3,
  channelDisplayName4,
  channelQueryResponseWithoutPaging,
} from '~/utils/tests';

import { getChannels } from '../getChannels';
import * as getChannelMarkers from '../../../marker/api/getChannelMarkers';
import { getChannelMessagePreviewWithUser } from '~/messagePreview/utils';

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.Channel[],
    loading: true,
    error: undefined as any,
    ...params,
  };
};

const getMarker = () => {
  return {
    unreadCount: 0,
    isDeleted: false,
  } as Amity.ChannelMarker;
};

describe('getChannels', () => {
  jest.spyOn(getChannelMarkers, 'getChannelMarkers').mockResolvedValue({
    data: [],
    cachedAt: undefined,
  });

  beforeAll(connectClient);
  afterAll(disconnectClient);
  beforeEach(enableCache);
  afterEach(disableCache);

  test('it should return channel collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);

    getChannels({}, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({
          data: convertRawChannelPayload(channelQueryResponse.data).channels.map(channel => {
            return { ...channel, messagePreview: null };
          }),
          loading: false,
        }),
      ),
    );
  });

  test('it should return data from cache first when call with the same query', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);

    getChannels({}, () => undefined);
    await pause();
    getChannels({}, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining(
        getSnapshot({
          data: convertRawChannelPayload(channelQueryResponse.data).channels.map(
            getChannelMessagePreviewWithUser,
          ),
          loading: true,
        }),
      ),
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({
          data: convertRawChannelPayload(channelQueryResponse.data).channels.map(
            getChannelMessagePreviewWithUser,
          ),
          loading: false,
        }),
      ),
    );
  });

  describe('when querying the channel collection with specific sort and filter options, the result is sorted and filtered correctly.', () => {
    const rawDeletedChannel = generateRawChannel({
      channelId: 'deleted-channel-id',
      isDeleted: true,
      type: 'conversation',
    });
    const deletedChannel = convertChannelFromRaw(rawDeletedChannel);
    const rawTaggedChannel = generateRawChannel({
      channelId: 'tagged-channel-id',
      tags: ['tag1', 'tag2'],
      type: 'conversation',
    });
    const taggedChannel = convertChannelFromRaw(rawTaggedChannel);
    const rawTaggedChannel2 = generateRawChannel({
      channelId: 'tagged-channel-id-2',
      tags: ['tag2'],
      type: 'conversation',
    });
    const taggedChannel2 = convertChannelFromRaw(rawTaggedChannel2);

    const filterCases: [string, Amity.ChannelLiveCollection, Amity.Channel[]][] = [
      [
        'deleted',
        { isDeleted: false },
        [
          channel1,
          { ...taggedChannel, messagePreview: null },
          { ...taggedChannel2, messagePreview: null },
        ],
      ],
      [
        'tagged',
        { tags: ['tag2'] },
        [
          { ...taggedChannel, messagePreview: null },
          { ...taggedChannel2, messagePreview: null },
        ],
      ],
      [
        'out excluded tags',
        { excludeTags: ['tag1'] },
        [
          channel1,
          { ...deletedChannel, messagePreview: null },
          { ...taggedChannel2, messagePreview: null },
        ],
      ],
      ['member', { membership: 'member' }, [channel1]],
      [
        'not member',
        { membership: 'notMember' },
        [
          { ...deletedChannel, messagePreview: null },
          { ...taggedChannel, messagePreview: null },
          { ...taggedChannel2, messagePreview: null },
        ],
      ],
      [
        'all membership',
        { membership: 'all' },
        [
          channel1,
          { ...deletedChannel, messagePreview: null },
          { ...taggedChannel, messagePreview: null },
          { ...taggedChannel2, messagePreview: null },
        ],
      ],
    ];

    const sortingCases: [
      string,
      Amity.ChannelLiveCollection,
      Amity.RawChannel[],
      Amity.RawChannel[],
    ][] = [
      [
        'displayName',
        { sortBy: 'displayName' },
        [channelDisplayName1, channelDisplayName2, channelDisplayName3],
        [channelDisplayName1, channelDisplayName2, channelDisplayName3],
      ],
      [
        'displayName + wrong order',
        { sortBy: 'displayName' },
        [channelDisplayName3, channelDisplayName2, channelDisplayName1],
        [channelDisplayName1, channelDisplayName2, channelDisplayName3],
      ],
      [
        'firstCreated',
        { sortBy: 'firstCreated' },
        [channelCreatedAt1, channelCreatedAt2, channelCreatedAt3],
        [channelCreatedAt1, channelCreatedAt2, channelCreatedAt3],
      ],
      [
        'firstCreated + wrong order',
        { sortBy: 'firstCreated' },
        [channelCreatedAt3, channelCreatedAt2, channelCreatedAt1],
        [channelCreatedAt1, channelCreatedAt2, channelCreatedAt3],
      ],
      [
        'lastCreated',
        { sortBy: 'lastCreated' },
        [channelCreatedAt3, channelCreatedAt2, channelCreatedAt1],
        [channelCreatedAt3, channelCreatedAt2, channelCreatedAt1],
      ],
      [
        'lastCreated + wrong order',
        { sortBy: 'lastCreated' },
        [channelCreatedAt1, channelCreatedAt2, channelCreatedAt3],
        [channelCreatedAt3, channelCreatedAt2, channelCreatedAt1],
      ],
      [
        'lastActivity',
        { sortBy: 'lastActivity' },
        [channelLastActivity3, channelLastActivity2, channelLastActivity1],
        [channelLastActivity3, channelLastActivity2, channelLastActivity1],
      ],
      [
        'lastActivity + wrong order',
        { sortBy: 'lastActivity' },
        [channelLastActivity1, channelLastActivity2, channelLastActivity3],
        [channelLastActivity3, channelLastActivity2, channelLastActivity1],
      ],
    ];

    const filterAndSortingCases: [
      string,
      Amity.ChannelLiveCollection,
      Amity.RawChannel[],
      Amity.RawChannel[],
    ][] = [
      [
        'types + displayName',
        { types: ['community', 'live'], sortBy: 'displayName' },
        [channelDisplayName2, channelDisplayName1, channelDisplayName3, channelDisplayName4],
        [channelDisplayName1, channelDisplayName2, channelDisplayName3],
      ],
    ];

    test.each(filterCases)('it should filter by %s channels', async (_filter, params, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          channels: [channelRaw1, rawDeletedChannel, rawTaggedChannel, rawTaggedChannel2],
          channelUsers: [rawChannelUser],
          files: [],
          users: [user11],
          ...mockPage,
        },
      });

      getChannels(params, callback);

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

    test.each(sortingCases)('it should sort by %s', async (_filter, params, returned, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          channels: returned,
          channelUsers: [rawChannelUser],
          files: [],
          users: [user11],
          ...mockPage,
        },
      });

      getChannels(params, callback);

      expect(callback).toHaveBeenCalledTimes(1);

      await pause();

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining(
          getSnapshot({
            loading: false,
            data: expected.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
          }),
        ),
      );
    });

    test.each(filterAndSortingCases)(
      'it should filter and sort by %s',
      async (_filter, params, returned, expected) => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue({
          data: {
            channels: returned,
            channelUsers: [rawChannelUser],
            files: [],
            users: [user11],
            ...mockPage,
          },
        });

        getChannels(params, callback);

        expect(callback).toHaveBeenCalledTimes(1);

        await pause();

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining(
            getSnapshot({
              loading: false,
              data: expected.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
            }),
          ),
        );
      },
    );
  });

  test('when querying two channel collections using different parameters, the results from each collection remain distinct and do not overlap', async () => {
    const callback = jest.fn();
    const callback2 = jest.fn();
    const callback1Response = [channelDisplayName2, channelDisplayName1, channelDisplayName3];
    const callback1Expected = [channelDisplayName1, channelDisplayName2, channelDisplayName3];
    const callback2Response = [channelCreatedAt3, channelCreatedAt2, channelCreatedAt1];

    client.http.get = jest.fn().mockImplementation((_url: string, params) => {
      if (!params.params.sortBy) {
        return {
          data: {
            channels: callback2Response,
            channelUsers: [rawChannelUser],
            files: [],
            users: [user11],
            ...mockPage,
          },
        };
      }
      return {
        data: {
          channels: callback1Response,
          channelUsers: [rawChannelUser],
          files: [],
          users: [user11],
          ...mockPage,
        },
      };
    });

    getChannels({ types: ['community', 'live'], sortBy: 'displayName' }, callback);
    getChannels({}, callback2);

    expect(callback).toHaveBeenCalledTimes(1);

    await pause(100);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).lastCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: callback1Expected.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        }),
      ),
    );

    expect(callback2).lastCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: callback2Response.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        }),
      ),
    );

    callback.mock.lastCall[0].onNextPage();

    await pause(100);

    expect(callback).lastCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: callback1Expected.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        }),
      ),
    );

    expect(callback2).lastCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: callback2Response.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        }),
      ),
    );

    callback2.mock.lastCall[0].onNextPage();

    await pause(100);

    expect(callback).lastCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: callback1Expected.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        }),
      ),
    );

    expect(callback2).lastCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: callback2Response.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        }),
      ),
    );
  });

  test('when querying two channel collections using different parameters, pagination for each collection operates correctly and does not overlap or mix results', async () => {
    const callback = jest.fn();
    const callback2 = jest.fn();

    const returnValue1Page1: Amity.RawChannel[] = [
      generateRawChannel({ channelId: 'channelId1', isDeleted: false, type: 'community' }),
      generateRawChannel({ channelId: 'channelId2', isDeleted: false, type: 'live' }),
      generateRawChannel({ channelId: 'channelId3', isDeleted: false, type: 'broadcast' }),
    ];

    const returnValue1Page2: Amity.RawChannel[] = [
      generateRawChannel({ channelId: 'channelId4', isDeleted: false }),
      generateRawChannel({ channelId: 'channelId5', isDeleted: false }),
    ];

    const returnValue2Page1: Amity.RawChannel[] = [
      generateRawChannel({ channelId: 'channelId36', tags: ['test'], displayName: '' }),
      generateRawChannel({ channelId: 'channelId35', tags: ['test'], displayName: '' }),
    ];

    const returnValue2Page2: Amity.RawChannel[] = [
      generateRawChannel({ channelId: 'channelId34', tags: ['test'], displayName: '' }),
      generateRawChannel({ channelId: 'channelId33', tags: ['test'], displayName: '' }),
    ];

    const returnValue2Page3: Amity.RawChannel[] = [
      generateRawChannel({ channelId: 'channelId32', tags: ['test'], displayName: '' }),
      generateRawChannel({ channelId: 'channelId31', tags: ['test'], displayName: '' }),
    ];

    const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
      if (!params?.params.tags) {
        if (params?.params?.options.token === 'eyJza2lwIjowLCJsaW1pdCI6MTB9') {
          return Promise.resolve({
            data: {
              channels: returnValue1Page2,
              channelUsers: [rawChannelUser],
              files: [],
              users: [user11],
              ...mockPage,
            },
          });
        }
        return Promise.resolve({
          data: {
            channels: returnValue1Page1,
            channelUsers: [rawChannelUser],
            files: [],
            users: [user11],
            paging: {
              next: 'eyJza2lwIjowLCJsaW1pdCI6MTB9',
            },
          },
        });
      }
      if (params?.params?.options?.token === 'eyJza2lwIjowLCJsaW1pdCI6MTB9') {
        return Promise.resolve({
          data: {
            channels: returnValue2Page2,
            channelUsers: [rawChannelUser],
            files: [],
            users: [user11],
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
              next: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDQ5MTExMTAwMDAwMH0=',
            },
          },
        });
      }
      if (
        params?.params?.options?.token ===
        'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDQ5MTExMTAwMDAwMH0='
      ) {
        return Promise.resolve({
          data: {
            channels: returnValue2Page3,
            channelUsers: [rawChannelUser],
            files: [],
            users: [user11],
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            },
          },
        });
      }

      return Promise.resolve({
        data: {
          channels: returnValue2Page1,
          channelUsers: [rawChannelUser],
          files: [],
          users: [user11],
          paging: {
            next: 'eyJza2lwIjowLCJsaW1pdCI6MTB9',
          },
        },
      });
    });

    getChannels({}, callback);
    getChannels({ types: ['community', 'live'], tags: ['test'], sortBy: 'displayName' }, callback2);

    expect(spyGet).toHaveBeenCalledWith('/api/v3/channels', {
      params: {
        options: { limit: 5 }, // default limit in SDK
      },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        error: undefined,
        loading: true,
      }),
    );

    await pause(100);

    expect(callback.mock.calls.length).toBeGreaterThan(1);

    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: returnValue1Page1.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        error: undefined,
        loading: false,
      }),
    );

    expect(callback2).lastCalledWith(
      expect.objectContaining({
        data: returnValue2Page1.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        error: undefined,
        loading: false,
      }),
    );

    // get page 2 for live collection #2
    callback2.mock.lastCall[0].onNextPage();

    await pause(100);

    // get page 3 for live collection #2
    callback2.mock.lastCall[0].onNextPage();

    await pause(100);

    expect(callback.mock.calls.length).toBeGreaterThan(1);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: returnValue1Page1.map(convertChannelFromRaw).map(getChannelMessagePreviewWithUser),
        error: undefined,
        loading: false,
      }),
    );

    expect(callback2.mock.calls.length).toBe(6);
    expect(callback2).lastCalledWith(
      expect.objectContaining({
        data: [...returnValue2Page1, ...returnValue2Page2, ...returnValue2Page3]
          .map(convertChannelFromRaw)
          .map(getChannelMessagePreviewWithUser),
        error: undefined,
        loading: false,
      }),
    );

    // get page 2 for live collection #1

    callback.mock.lastCall[0].onNextPage();

    await pause(100);

    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: [...returnValue1Page1, ...returnValue1Page2]
          .map(convertChannelFromRaw)
          .map(getChannelMessagePreviewWithUser),
        error: undefined,
        loading: false,
      }),
    );
  });

  test('it should return method to fetch next page', async () => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue(channelQueryResponse)
      .mockResolvedValueOnce(channelQueryResponsePage2);

    getChannels({}, callback);
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
          data: [
            ...convertRawChannelPayload(channelQueryResponsePage2.data).channels.map(channel => {
              return { ...channel, messagePreview: null };
            }),
            ...convertRawChannelPayload(channelQueryResponse.data).channels.map(channel => {
              return { ...channel, messagePreview: null };
            }),
          ],
        }),
      ),
    );
  });

  describe('events', () => {
    const rawNewChannel = generateRawChannel({ channelId: 'new-channel-id' });

    const rawUpdatedChannel = { ...channelRaw1, updatedAt: new Date().toISOString() };

    const cases: [string, keyof Amity.Events, Amity.RawChannel, Amity.Channel[]][] = [
      [
        'it should add new channel to collection onCreate',
        'channel.created',
        rawNewChannel,
        [{ ...convertChannelFromRaw(rawNewChannel), messagePreview: null }, channel1, channel2],
      ],
      [
        'it should add new channel to collection onJoin',
        'channel.joined',
        rawNewChannel,
        [{ ...convertChannelFromRaw(rawNewChannel), messagePreview: null }, channel1, channel2],
      ],
      [
        'it should update channel in collection onUpdate',
        'channel.updated',
        rawUpdatedChannel,
        [{ ...channel1, updatedAt: rawUpdatedChannel.updatedAt }, channel2],
      ],
      [
        'it should update channel in collection onMuted',
        'channel.setMuted',
        { ...channelRaw1, isMuted: true },
        [{ ...channel1, isMuted: true }, channel2],
      ],
      [
        'it should remove channel from collection onDelete',
        'channel.deleted',
        { ...channelRaw1, isDeleted: true },
        [channel2],
      ],
      [
        'it should remove channel from collection onLeft',
        'channel.left',
        { ...channelRaw1, isDeleted: true },
        [channel2],
      ],
    ];

    test.each(cases)('%s', async (test, event, rawChannel, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);

      getChannels({ isDeleted: false }, callback);
      await pause();
      client.emitter.emit(event, {
        channels: [rawChannel],
        channelUsers: [rawChannelUser],
        users: [],
        files: [],
      });
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

    it('should add the channel to collection if user is added to the channel and member filter is applied', async () => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          channels: [channelRaw2],
          channelUsers: [rawChannelUser2],
          files: [],
          users: [user11],
          ...mockPage,
        },
      });

      getChannels({ membership: 'member' }, callback);
      await pause();
      client.emitter.emit('channel.membersAdded', {
        channels: [channelRaw1],
        channelUsers: [rawChannelUser],
        users: [user11],
        files: [],
        messagePreviews: [],
      });
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining(getSnapshot({ data: [channel1, channel2], loading: false })),
      );
    });

    it('should add the channel to collection if user is removed from the channel and nonMember filter is applied', async () => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          channels: [channelRaw2],
          channelUsers: [],
          files: [],
          users: [user11],
          ...mockPage,
        },
      });

      getChannels({ membership: 'notMember' }, callback);
      await pause();
      client.emitter.emit('channel.membersRemoved', {
        channels: [channelRaw1],
        channelUsers: [{ ...rawChannelUser, membership: 'none' }],
        users: [user11],
        files: [],
        messagePreviews: [],
      });
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining(getSnapshot({ data: [channel1, channel2], loading: false })),
      );
    });

    it('should add the channel to collection if tag is added to the channel and tags is applied', async () => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          channels: [channelRaw2],
          channelUsers: [rawChannelUser2],
          files: [],
          users: [user11],
          ...mockPage,
        },
      });

      getChannels({ tags: ['tag1'] }, callback);
      await pause();
      client.emitter.emit('channel.updated', {
        channels: [{ ...channelRaw1, tags: ['tag1'] }],
        channelUsers: [rawChannelUser],
        users: [user11],
        files: [],
        messagePreviews: [],
      });
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining(
          getSnapshot({ data: [{ ...channel1, tags: ['tag1'] }, channel2], loading: false }),
        ),
      );
    });

    /**
     * TODO: check if this test is valid, by checking event payload from the event that trigger this case
     * check event payload community channel if it is the same as other channel
     */

    test.each([
      [
        'should remove the channel from the collection if user is removed from the channel and member filter is applied',
        'channel.membersRemoved',
      ],
      [
        'should remove the channel from the collection if user is left from the channel and member filter is applied',
        'channel.left',
      ],
    ] as [string, keyof Amity.Events][])('%s', async (test, event) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          channels: [channelRaw1, channelRaw2],
          channelUsers: [rawChannelUser, rawChannelUser2],
          files: [],
          users: [user11],
          ...mockPage,
        },
      });

      getChannels({ membership: 'member' }, callback);
      await pause();
      client.emitter.emit(event, {
        channels: [channelRaw1],
        channelUsers: [{ ...rawChannelUser, membership: 'none' }],
        users: [user11],
        files: [],
      });
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining(getSnapshot({ data: [channel2], loading: false })),
      );
    });

    /**
     * TODO: check if this test is valid, by checking event payload from the event that trigger this case
     * check event payload community channel if it is the same as other channel
     */

    test.each([
      [
        'should remove the channel from the collection if user is added to the channel and notMember filter is applied',
        'channel.membersAdded',
      ],
      [
        'should remove the channel from the collection if user is joined to the channel and notMember filter is applied',
        'channel.joined',
      ],
    ] as [string, keyof Amity.Events][])('%s', async (test, event) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          channels: [channelRaw1, channelRaw2],
          channelUsers: [],
          files: [],
          users: [user11],
          ...mockPage,
        },
      });

      getChannels({ membership: 'notMember' }, callback);
      await pause();
      client.emitter.emit('channel.membersAdded', {
        channels: [channelRaw1],
        channelUsers: [rawChannelUser],
        users: [user11],
        files: [],
        messagePreviews: [],
      });
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining(getSnapshot({ data: [channel2], loading: false })),
      );
    });
  });

  // TODO: re-enable this after implement marker-sync service
  xit('should increase the unread count once message is created', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        channels: [channelRaw1],
        channelUsers: [rawChannelUser],
        files: [],
        users: [user11],
        ...mockPage,
      },
    });

    getChannels({}, callback);
    await pause();
    client.emitter.emit('message.created', {
      messages: [
        generateRawMessage({
          channelPublicId: channelRaw1.channelId,
          messageFeedId: channelRaw1._id,
          segment: channelRaw1.messageCount + 1,
        }),
      ],
      messageFeeds: [],
      files: [],
      users: [],
      reactions: [],
    });
    await pause(500);

    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining(
        getSnapshot({
          data: [
            {
              ...channel1,
              lastActivity: expect.anything(),
              messageCount: channel1.messageCount + 1,
              updatedAt: expect.anything(),
            },
          ],
          loading: false,
        }),
      ),
    );
  });
});

describe('getChannels by channelIds', () => {
  jest.spyOn(getChannelMarkers, 'getChannelMarkers').mockResolvedValue({
    data: [],
    cachedAt: undefined,
  });

  beforeAll(connectClient);
  afterAll(disconnectClient);
  beforeEach(enableCache);
  afterEach(disableCache);

  test('it should return channel collection when query by channelIds', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(channelQueryResponseWithoutPaging);

    getChannels({}, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({
          data: convertRawChannelPayload(channelQueryResponse.data).channels.map(channel => {
            return { ...channel, messagePreview: null };
          }),
          loading: false,
        }),
      ),
    );
  });

  describe('events', () => {
    const rawNewChannel = generateRawChannel({ channelId: 'new-channel-id' });

    const rawUpdatedChannel = { ...channelRaw1, updatedAt: new Date().toISOString() };

    const cases: [string, keyof Amity.Events, Amity.RawChannel, Amity.Channel[]][] = [
      [
        'it should not add new channel to collection onCreate',
        'channel.created',
        rawNewChannel,
        [channel1, channel2],
      ],
      [
        'it should not add new channel to collection onJoin',
        'channel.joined',
        rawNewChannel,
        [channel1, channel2],
      ],
      [
        'it should update channel in collection onUpdate',
        'channel.updated',
        rawUpdatedChannel,
        [{ ...channel1, updatedAt: rawUpdatedChannel.updatedAt }, channel2],
      ],
      [
        'it should update channel in collection onMuted',
        'channel.setMuted',
        { ...channelRaw1, isMuted: true },
        [{ ...channel1, isMuted: true }, channel2],
      ],
      [
        'it should not remove channel from collection onDelete',
        'channel.deleted',
        { ...channelRaw1, isDeleted: true },
        [channel1, channel2],
      ],
      [
        'it should not remove channel from collection onLeft',
        'channel.left',
        { ...channelRaw1, isDeleted: true },
        [channel1, channel2],
      ],
    ];

    test.each(cases)('%s', async (test, event, rawChannel, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);

      getChannels({ channelIds: [channelRaw1._id, channelRaw2._id] }, callback);
      await pause();
      client.emitter.emit(event, {
        channels: [rawChannel],
        channelUsers: [rawChannelUser],
        users: [],
        files: [],
      });
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        event === 'channel.updated' || event === 'channel.setMuted' ? 3 : 2,
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
