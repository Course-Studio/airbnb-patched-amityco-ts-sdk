import { getPastDate } from '~/core/model';
import { disableCache, enableCache } from '~/cache/api';
import {
  bannedChannelUser,
  channel1,
  channelRaw1,
  channelUser,
  channelUser3,
  channelUserModel,
  channelUserQueryResponse,
  channelUserWithRole,
  client,
  connectClient,
  disconnectClient,
  emptyChannelUserQueryResponse,
  pause,
  rawBannedChannelUser,
  rawChannelUser,
  rawChannelUserWithRole,
  user11,
  user13,
  user14,
} from '~/utils/tests';

// makes it easier to spy on applyFilter
import * as getMembersModule from '../getMembers';

const { getMembers, applyFilter } = getMembersModule;

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.RawMembership<'channel'>[],
    loading: true,
    error: undefined as any,
    ...params,
  };
};

describe('getMembers', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const { channelId } = channel1;

  test('it should return channel members collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(channelUserQueryResponse);

    getMembers({ channelId }, callback);
    await pause();

    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(getSnapshot({ data: channelUserModel, loading: false })),
    );
  });

  const events: [
    string,
    keyof Amity.Events,
    Amity.RawMembership<'channel'>,
    Amity.InternalUser,
    Amity.Membership<'channel'>[],
  ][] = [
    [
      'it should add new member to collection onMemberAdded',
      'channel.membersAdded',
      rawChannelUserWithRole,
      user14,
      [channelUserWithRole, channelUser, channelUser3],
    ],
    [
      'it should remove channel member from collection onMemberRemoved',
      'channel.membersRemoved',
      { ...rawChannelUser, membership: 'none' },
      user11,
      [channelUser3],
    ],
    [
      'it should update channel member membership on onChannelMemberBanned',
      'channel.banned',
      { ...rawChannelUser, membership: 'banned', isBanned: true },
      user11,
      [{ ...channelUser, membership: 'banned', isBanned: true }, channelUser3],
    ],
    [
      'it should update channel member membership on onChannelMemberUnbanned',
      'channel.unbanned',
      { ...rawChannelUser, membership: 'none', isBanned: false },
      user11,
      [channelUser3],
    ],
  ];

  test.each(events)('%s', async (test, event, channelUser, user, expected) => {
    const callback = jest.fn();

    client.http.get = jest.fn().mockImplementation(url => {
      if (url === `/api/v4/channels/${encodeURIComponent(channelId)}/users`)
        return Promise.resolve(channelUserQueryResponse);

      return undefined;
    });

    getMembers({ channelId }, callback);
    await pause();

    client.emitter.emit(event, {
      channels: [channelRaw1],
      channelUsers: [channelUser],
      users: [user],
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

  it('should add the banned user to the collection if channel.banned event happens', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(emptyChannelUserQueryResponse);

    getMembers({ channelId, memberships: ['banned'] }, callback);
    await pause();
    client.emitter.emit('channel.banned', {
      channels: [channelRaw1],
      channelUsers: [rawBannedChannelUser],
      users: [user13],
      files: [],
      messagePreviews: [],
    });
    await pause();

    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining(getSnapshot({ data: [bannedChannelUser], loading: false })),
    );
  });

  // skip because new live collection do apply filter before notify
  // TODO: check if it should do filtering only on RTE event or not
  test.skip('it should apply filter on RTE only', async () => {
    const callback = jest.fn();
    const applyFilterSpy = jest.spyOn(getMembersModule, 'applyFilter');

    client.http.get = jest.fn().mockResolvedValue(emptyChannelUserQueryResponse);

    getMembers({ channelId, memberships: ['banned'] }, callback);
    await pause();

    expect(applyFilterSpy).not.toHaveBeenCalled();

    client.emitter.emit('channel.banned', {
      channels: [channelRaw1],
      channelUsers: [rawBannedChannelUser],
      users: [user13],
      files: [],
      messagePreviews: [],
    });
    await pause();

    expect(applyFilterSpy).toHaveBeenCalled();
  });
});

describe('getMembers > applyFilter', () => {
  const { channelId } = channel1;

  const ch1 = {
    channelId,
    userId: 'test',
    membership: 'member',
    readToSegment: 1,
    roles: ['test-role'],
    lastMentionedSegment: 1,
    createdAt: new Date().toISOString(),
  } as Amity.Membership<'channel'>;

  const ch2 = {
    channelId,
    userId: 'test1',
    membership: 'banned',
    readToSegment: 1,
    lastMentionedSegment: 1,
    createdAt: getPastDate(),
  } as Amity.Membership<'channel'>;

  const filters: [
    string,
    Amity.ChannelMembersLiveCollection,
    Amity.Membership<'channel'>[],
    Amity.Membership<'channel'>[],
  ][] = [
    ['it should filter by roles', { channelId, roles: ['test-role'] }, [ch1, ch2], [ch1]],
    [
      'it should filter by membership:member',
      { channelId, memberships: ['member'] },
      [ch1, ch2],
      [ch1],
    ],
    [
      'it should filter by membership:banned',
      { channelId, memberships: ['banned'] },
      [ch1, ch2],
      [ch2],
    ],
    ['it should sort by last created', { channelId }, [ch1, ch2], [ch1, ch2]],
    [
      'it should sort by first created',
      { channelId, sortBy: 'firstCreated' },
      [ch1, ch2],
      [ch2, ch1],
    ],
  ];

  test.each(filters)('%s', (test, param, input, expected) => {
    expect(applyFilter(input, param)).toStrictEqual(expected);
  });
});
