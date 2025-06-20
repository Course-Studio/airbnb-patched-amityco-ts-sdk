import { disableCache, enableCache } from '~/cache/api';
import {
  pause,
  client,
  connectClient,
  disconnectClient,
  community11,
  user11,
  communityUser11,
  communityUser12,
} from '~/utils/tests';
import { getFutureDate } from '~/core/model';

import { getCommunity } from '../getCommunity';

const { communityId } = community11;
const response = {
  data: {
    communities: [community11],
    communityUsers: [communityUser11],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('getCommunity events', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const events: [string, keyof Amity.MqttCommunityEvents][] = [
    ['it should get update on community.updated event', 'community.updated'],
    ['it should get update on community.deleted event', 'community.deleted'],
  ];

  test.each(events)('%s', async (test, event) => {
    const update =
      event === 'community.updated'
        ? {
            ...community11,
            displayName: 'updated-name',
            updatedAt: getFutureDate(community11.updatedAt),
          }
        : {
            ...community11,
            isDeleted: true,
            updatedAt: getFutureDate(community11.updatedAt),
          };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    const unsub = getCommunity(communityId, callback);
    await pause();

    client.emitter.emit(event, {
      communities: [update],
      communityUsers: [],
      categories: [],
      feeds: [],
      users: [user11],
      files: [],
    });
    await pause();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: update,
        loading: false,
      }),
    );

    unsub();
  });

  const communityUserEvents: [string, keyof Amity.MqttCommunityUserEvents][] = [
    ['it should add user on community.joined event', 'community.joined'],
    ['it should get update on community.left event', 'community.left'],
    ['it should get update on community.userChanged event', 'community.userChanged'],
    ['it should get update on community.userBanned event', 'community.userBanned'],
    ['it should get update on community.userUnbanned event', 'community.userUnbanned'],
  ];

  test.each(communityUserEvents)('%s', async (test, event) => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    const community = {
      ...community11,
      updatedAt: getFutureDate(community11.updatedAt),
    };
    let communityUsers: Amity.RawMembership<'community'>[];
    let communities: Amity.RawCommunity[];

    switch (event) {
      case 'community.userChanged':
      case 'community.left':
        communityUsers = [communityUser11];
        communities = [{ ...community, isJoined: true }];
        break;

      case 'community.userBanned':
        communities = [{ ...community, isJoined: true }];
        communityUsers = [{ ...communityUser11, communityMembership: 'banned' }];
        break;

      case 'community.userUnbanned':
        communityUsers = [communityUser11];
        communities = [{ ...community, isJoined: true }];
        break;

      // community.joined
      default:
        communities = [community];
        communityUsers = [communityUser12];
    }

    const unsub = getCommunity(communityId, callback);
    await pause();

    client.emitter.emit(event, {
      communities,
      communityUsers,
      categories: [],
      feeds: [],
      users: [user11],
      files: [],
    });
    await pause();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: communities[0],
      }),
    );

    unsub();
  });
});
