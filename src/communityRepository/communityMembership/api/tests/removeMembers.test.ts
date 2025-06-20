import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { getResolver } from '~/core/model';

import {
  client,
  community11,
  communityUser11,
  user11,
  connectClient,
  disconnectClient,
} from '~/utils/tests';

import { onCommunityUserRemoved } from '../../events';
import { removeMembers } from '../removeMembers';

const communityToRemoveUser = community11;
const userToRemove = communityUser11;
const removedUser = { ...communityUser11, communityMembership: 'none' };

const resolvedDeleteValue = {
  data: {
    communities: [communityToRemoveUser],
    communityUsers: [removedUser],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('removeCommunityMembers', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('should return true value', async () => {
    client.http.delete = jest.fn().mockResolvedValue(resolvedDeleteValue);

    const recieved = removeMembers(communityToRemoveUser.communityId, [userToRemove.userId]);

    await expect(recieved).resolves.toBe(true);
  });

  test('should throw an error if request fails', async () => {
    client.http.delete = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(
      removeMembers(communityToRemoveUser.communityId, [userToRemove.userId]),
    ).rejects.toThrow('error');
  });

  test('should create cache after removed user', async () => {
    enableCache();
    client.http.delete = jest.fn().mockResolvedValue(resolvedDeleteValue);

    await removeMembers(communityToRemoveUser.communityId, [userToRemove.userId]);

    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({
        communityId: communityToRemoveUser.communityId,
        userId: userToRemove.userId,
      }),
    ])?.data;

    expect(recieved).toEqual(expect.objectContaining(removedUser));

    disableCache();
  });

  test('should fire event `onCommunityUserRemoved`', async () => {
    let dispose;
    client.http.delete = jest.fn().mockResolvedValueOnce(resolvedDeleteValue);

    const callback = new Promise(resolve => {
      dispose = onCommunityUserRemoved(resolve);
    }).finally(dispose);

    await removeMembers(communityToRemoveUser.communityId, [userToRemove.userId]);

    await expect(callback).resolves.toEqual(expect.objectContaining(communityToRemoveUser));
  });
});
