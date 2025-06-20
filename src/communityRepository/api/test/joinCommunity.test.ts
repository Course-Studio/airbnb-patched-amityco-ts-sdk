import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { getResolver } from '~/core/model';

import {
  client,
  connectClient,
  disconnectClient,
  community11,
  communityUser11,
  user11,
} from '~/utils/tests';

import { onCommunityJoined } from '../../communityMembership/events';
import { joinCommunity } from '../joinCommunity';

const communityToJoin = community11;
const joinedUser = communityUser11;

const resolvedPostValue = {
  data: {
    communities: [communityToJoin],
    communityUsers: [joinedUser],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('joinCommunity', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('should return true value', async () => {
    client.http.post = jest.fn().mockResolvedValue(resolvedPostValue);

    const recieved = joinCommunity(communityToJoin.communityId);

    await expect(recieved).resolves.toBe(true);
  });

  test('should throw an error if request fails', async () => {
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(joinCommunity(communityToJoin.communityId)).rejects.toThrow('error');
  });

  test('should create cache after join community', async () => {
    enableCache();
    client.http.post = jest.fn().mockResolvedValue(resolvedPostValue);

    await joinCommunity(communityToJoin.communityId);

    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({
        communityId: communityToJoin.communityId,
        userId: joinedUser.userId,
      }),
    ])?.data;

    expect(recieved).toEqual(expect.objectContaining(joinedUser));

    disableCache();
  });

  test('should fire event `onCommunityJoined`', async () => {
    let dispose;
    client.http.post = jest.fn().mockResolvedValueOnce(resolvedPostValue);

    const callback = new Promise(resolve => {
      dispose = onCommunityJoined(resolve);
    }).finally(dispose);

    await joinCommunity(communityToJoin.communityId);

    await expect(callback).resolves.toEqual(
      expect.objectContaining({ ...communityToJoin, isJoined: true }),
    );
  });
});
