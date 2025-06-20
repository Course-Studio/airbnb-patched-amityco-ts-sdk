import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { getResolver } from '~/core/model';

import { client, community11, communityUser11, user11 } from '~/utils/tests';

import { addRoles } from '../addRoles';

const roleToAdd = 'some-new-sole';
const userCommunity = community11;
const userToAddRole = communityUser11;

const addedRoleUser = {
  ...userToAddRole,
  roles: [...userToAddRole.roles, roleToAdd],
};

const resolvedPostValue = {
  data: {
    communities: [userCommunity],
    communityUsers: [addedRoleUser],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('community/ moderation/ addRoles', () => {
  test('should return true', async () => {
    client.http.post = jest.fn().mockResolvedValue(resolvedPostValue);

    const recieved = addRoles(userCommunity.communityId, [roleToAdd], [userToAddRole.userId]);

    await expect(recieved).resolves.toBe(true);
  });

  test('should throw an error if request fails', async () => {
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(
      addRoles(userCommunity.communityId, [roleToAdd], [userToAddRole.userId]),
    ).rejects.toThrow('error');
  });

  test('should create cache after added user', async () => {
    enableCache();
    client.http.post = jest.fn().mockResolvedValue(resolvedPostValue);

    await addRoles(userCommunity.communityId, [roleToAdd], [userToAddRole.userId]);
    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({
        communityId: userCommunity.communityId,
        userId: userToAddRole.userId,
      }),
    ])?.data;

    expect(recieved).toEqual(expect.objectContaining(addedRoleUser));

    disableCache();
  });
});
