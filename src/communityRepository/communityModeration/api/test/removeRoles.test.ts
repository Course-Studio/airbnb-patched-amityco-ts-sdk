import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { getResolver } from '~/core/model';

import { client, community11, communityUser11, user11 } from '~/utils/tests';

import { removeRoles } from '../removeRoles';

const community = community11;
const roleToRemove = 'some-exist-role';
const userToRemoveRole = {
  ...communityUser11,
  roles: [...communityUser11.roles, roleToRemove],
};
const removedRoleUser = { ...communityUser11 };

const resolvedDeleteValue = {
  data: {
    communities: [community],
    communityUsers: [removedRoleUser],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('community / roles / removeRoles', () => {
  test('should return true', async () => {
    client.http.delete = jest.fn().mockResolvedValue(resolvedDeleteValue);

    const recieved = removeRoles(community.communityId, [roleToRemove], [userToRemoveRole.userId]);

    await expect(recieved).resolves.toBe(true);
  });

  test('should throw an error if request fails', async () => {
    client.http.delete = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(
      removeRoles(community.communityId, [roleToRemove], [userToRemoveRole.userId]),
    ).rejects.toThrow('error');
  });

  test('should create cache after added user', async () => {
    enableCache();
    client.http.delete = jest.fn().mockResolvedValue(resolvedDeleteValue);

    await removeRoles(community.communityId, [roleToRemove], [userToRemoveRole.userId]);
    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({
        communityId: community.communityId,
        userId: userToRemoveRole.userId,
      }),
    ])?.data;

    expect(recieved).toEqual(expect.objectContaining(removedRoleUser));

    disableCache();
  });
});
