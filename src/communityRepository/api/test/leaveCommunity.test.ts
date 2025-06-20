import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';
import { getResolver } from '~/core/model';
import {
  client,
  connectClient,
  disconnectClient,
  community11,
  communityUser11,
  user11,
} from '~/utils/tests';

import { leaveCommunity } from '../leaveCommunity';
import { onCommunityLeft } from '../../communityMembership/events';

const communityToLeave = community11;
const toLeaveUser = { ...communityUser11, communityMembership: 'member' };
const leavedUser = { ...communityUser11, communityMembership: 'none' };

const resolvedDeleteValue = {
  data: {
    communities: [communityToLeave],
    communityUsers: [leavedUser],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('leaveCommunity', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('should return true value', async () => {
    client.http.delete = jest.fn().mockResolvedValueOnce(resolvedDeleteValue);

    await expect(leaveCommunity(communityToLeave.communityId)).resolves.toBe(true);
  });

  test('should throw an error if request fails', async () => {
    client.http.delete = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(leaveCommunity(communityToLeave.communityId)).rejects.toThrow('error');
  });

  test('should update cache after leaved community', async () => {
    enableCache();
    client.http.delete = jest.fn().mockResolvedValueOnce(resolvedDeleteValue);
    pushToCache(
      [
        'communityUsers',
        'get',
        getResolver('communityUsers')({
          communityId: communityToLeave.communityId,
          userId: toLeaveUser.userId,
        }),
      ],
      toLeaveUser,
    );

    await leaveCommunity(communityToLeave.communityId);
    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({
        communityId: communityToLeave.communityId,
        userId: toLeaveUser.userId,
      }),
    ])?.data;

    expect(recieved).toEqual(expect.objectContaining(leavedUser));

    disableCache();
  });

  test('should fire event `onCommunityLeft`', async () => {
    let dispose;
    client.http.delete = jest.fn().mockResolvedValueOnce(resolvedDeleteValue);

    const callbackPromise = new Promise(resolve => {
      dispose = onCommunityLeft(resolve);
    }).finally(dispose);

    await leaveCommunity(toLeaveUser.userId);

    await expect(callbackPromise).resolves.toEqual(expect.objectContaining(communityToLeave));
  });
});
