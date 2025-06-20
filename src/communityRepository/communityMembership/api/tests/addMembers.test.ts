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

import { onCommunityUserAdded } from '../../events';
import { addMembers } from '../addMembers';

const communityToAddUserTo = community11;
const userToAdd = communityUser11;

const resolvedPostValue = {
  data: {
    communities: [communityToAddUserTo],
    communityUsers: [userToAdd],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('addCommunityMembers', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('should return true value', async () => {
    client.http.post = jest.fn().mockResolvedValue(resolvedPostValue);

    const recieved = addMembers(communityToAddUserTo.communityId, [userToAdd.userId]);

    await expect(recieved).resolves.toBe(true);
  });

  test('should throw an error if request fails', async () => {
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(addMembers(communityToAddUserTo.communityId, [userToAdd.userId])).rejects.toThrow(
      'error',
    );
  });

  test('should create cache after added user', async () => {
    enableCache();
    client.http.post = jest.fn().mockResolvedValue(resolvedPostValue);

    await addMembers(communityToAddUserTo.communityId, [userToAdd.userId]);
    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({
        communityId: communityToAddUserTo.communityId,
        userId: userToAdd.userId,
      }),
    ])?.data;

    expect(recieved).toEqual(expect.objectContaining(userToAdd));

    disableCache();
  });

  test('should fire event `onCommunityUserAdded`', async () => {
    let dispose;
    client.http.post = jest.fn().mockResolvedValueOnce(resolvedPostValue);

    const callback = new Promise(resolve => {
      dispose = onCommunityUserAdded(resolve);
    }).finally(dispose);

    await addMembers(communityToAddUserTo.communityId, [userToAdd.userId]);

    await expect(callback).resolves.toEqual(
      expect.objectContaining({ ...communityToAddUserTo, isJoined: true }),
    );
  });
});
