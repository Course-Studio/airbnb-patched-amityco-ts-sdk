import { disableCache, enableCache } from '~/cache/api';
import {
  bannedChannelUser,
  channel1,
  channelRaw1,
  channelUser,
  channelUser3,
  channelUserModel,
  channelUserQueryResponse,
  channelUserQueryResponsePage2,
  channelUserWithRole,
  client,
  connectClient,
  convertRawChannelPayload,
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

import { searchMembers } from '../searchMembers';

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.RawMembership<'channel'>[],
    loading: true,
    error: undefined as any,
    ...params,
  };
};

describe('searchMembers', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const { channelId } = channel1;

  test('it should return channel members collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(channelUserQueryResponse);

    searchMembers({ channelId }, callback);
    await pause();

    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(getSnapshot({ data: channelUserModel, loading: false })),
    );
  });

  test('it should return method to fetch next page', async () => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue(channelUserQueryResponse)
      .mockResolvedValueOnce(channelUserQueryResponsePage2);

    searchMembers({ channelId }, callback);
    await pause();

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.lastCall).toHaveLength(1);

    const { onNextPage, hasNextPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    onNextPage();
    await pause();

    const payload = convertRawChannelPayload(channelUserQueryResponse.data);
    const payload2 = convertRawChannelPayload(channelUserQueryResponsePage2.data);

    const snapshot = getSnapshot();
    snapshot.loading = false;
    snapshot.data = [...payload2.channelUsers, ...payload.channelUsers];

    expect(callback).toHaveBeenNthCalledWith(4, expect.objectContaining(snapshot));
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

    searchMembers({ channelId }, callback);
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

    searchMembers({ channelId, memberships: ['banned'] }, callback);
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
});
