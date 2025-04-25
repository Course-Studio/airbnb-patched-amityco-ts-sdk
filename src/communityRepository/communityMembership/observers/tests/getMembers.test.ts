import { getPastDate } from '~/core/model';
import { disableCache, enableCache } from '~/cache/api';
import {
  bannedCommunityUser,
  client,
  community11,
  communityUser11,
  communityUser13,
  communityUserQueryResponse,
  communityUserQueryResponsePage2,
  connectClient,
  convertedCommunityUser1,
  convertedCommunityUser2,
  convertedCommunityUser3,
  disconnectClient,
  pause,
  user11,
  user13,
  withRoleCommunityUser,
} from '~/utils/tests';

// makes it easier to spy on applyFilter
import * as getMembersModule from '../getMembers';

const { getMembers, applyFilter } = getMembersModule;

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.Membership<'community'>[],
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

  const { communityId } = community11;

  test('it should return community members collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(communityUserQueryResponse);

    getMembers({ communityId }, callback);
    await pause();

    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({ data: [convertedCommunityUser1, convertedCommunityUser2], loading: false }),
      ),
    );
  });

  test('it should return method to fetch next page', async () => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue(communityUserQueryResponse)
      .mockResolvedValueOnce(communityUserQueryResponsePage2);

    getMembers({ communityId, sortBy: 'firstCreated' }, callback);
    await pause();

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.lastCall).toHaveLength(1);

    const { onNextPage, hasNextPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    onNextPage();
    await pause();

    const payload = [convertedCommunityUser1, convertedCommunityUser2];
    const payload2 = [withRoleCommunityUser, bannedCommunityUser];

    const snapshot = getSnapshot();
    snapshot.loading = false;
    snapshot.data = [...payload2, ...payload];

    expect(callback).toHaveBeenNthCalledWith(4, expect.objectContaining(snapshot));
  });

  const events: [
    string,
    keyof Amity.Events,
    Amity.RawMembership<'community'>,
    Amity.InternalUser,
    Amity.Membership<'community'>[],
  ][] = [
    [
      'it should add new member to collection onJoined',
      'community.joined',
      communityUser13,
      user13,
      [convertedCommunityUser1, convertedCommunityUser3, convertedCommunityUser2],
    ],
    [
      'it should remove member from collection onLeft',
      'community.left',
      { ...communityUser11, communityMembership: 'none' },
      user11,
      [{ ...convertedCommunityUser1, communityMembership: 'none' }, convertedCommunityUser2],
    ],
    [
      'it should add new member to collection onMemberCountChanged',
      'community.userChanged',
      communityUser13,
      user13,
      [convertedCommunityUser1, convertedCommunityUser3, convertedCommunityUser2],
    ],
    [
      'it should update member in collection onMemberCountChanged',
      'community.userChanged',
      { ...communityUser13, communityMembership: 'none' },
      user13,
      [
        convertedCommunityUser1,
        { ...convertedCommunityUser3, communityMembership: 'none' },
        convertedCommunityUser2,
      ],
    ],
    [
      'it should update member membership on ban',
      'community.userBanned',
      { ...communityUser11, communityMembership: 'banned' },
      user11,
      [{ ...convertedCommunityUser1, communityMembership: 'banned' }, convertedCommunityUser2],
    ],
    [
      'it should update membership on Unban',
      'community.userUnbanned',
      communityUser13,
      user13,
      [convertedCommunityUser1, convertedCommunityUser3, convertedCommunityUser2],
    ],
  ];

  test.each(events)('%s', async (test, event, communityUserRaw, user, expected) => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(communityUserQueryResponse);

    getMembers({ communityId, sortBy: 'firstCreated' }, callback);
    await pause();

    client.emitter.emit(event, {
      communities: [community11],
      communityUsers: [communityUserRaw],
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

  test('it should apply fileters on RTE only', async () => {
    const callback = jest.fn();
    const applyFilterSpy = jest.spyOn(getMembersModule, 'applyFilter');
    client.http.get = jest.fn().mockResolvedValue(communityUserQueryResponse);

    getMembers({ communityId, sortBy: 'firstCreated' }, callback);
    await pause();

    expect(applyFilterSpy).not.toHaveBeenCalled();

    client.emitter.emit('community.joined', {
      communities: [community11],
      communityUsers: [communityUser13],
      users: [user13],
      files: [],
      categories: [],
      feeds: [],
    });
    await pause();

    expect(applyFilterSpy).toHaveBeenCalled();
  });
});

describe('getMembers > applyFilter', () => {
  const { communityId } = community11;

  const m1 = {
    communityId,
    userId: 'test',
    communityMembership: 'member',
    roles: ['test-role'],
    createdAt: new Date().toISOString(),
  } as Amity.Membership<'community'>;

  const m2 = {
    communityId,
    userId: 'searchable',
    communityMembership: 'banned',
    createdAt: getPastDate(),
  } as Amity.Membership<'community'>;

  const filters: [
    string,
    Amity.CommunityMemberLiveCollection,
    Amity.Membership<'community'>[],
    Amity.Membership<'community'>[],
  ][] = [
    ['it should filter by roles', { communityId, roles: ['test-role'] }, [m1, m2], [m1]],
    [
      'it should filter by memberships: member',
      { communityId, memberships: ['member'] },
      [m1, m2],
      [m1],
    ],
    [
      'it should filter by memberships: banned',
      { communityId, memberships: ['banned'] },
      [m1, m2],
      [m2],
    ],
    ['it should sort by last created', { communityId }, [m1, m2], [m1, m2]],
    [
      'it should sort by first created',
      { communityId, sortBy: 'firstCreated' },
      [m1, m2],
      [m2, m1],
    ],
  ];

  test.each(filters)('%s', (test, param, input, expected) => {
    expect(applyFilter(input, param)).toStrictEqual(expected);
  });
});
