import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { prepareMembershipPayload } from '~/group/utils';
import { getResolver } from '~/core/model';
import { ASCError } from '~/core/errors';

import { client, community11, communityUser11, user11 } from '~/utils/tests';

import { unbanMembers } from '../unbanMembers';

const userCommunity = community11;
const user = {
  ...communityUser11,
  communityMebership: 'none',
};
const resolvedCommunityValue = {
  data: {
    communities: [userCommunity],
    communityUsers: [user],
    files: [],
    users: [user11],
    categories: [],
    feeds: [],
  },
};

describe('community/ moderation/ unbanMembers', () => {
  beforeEach(enableCache);
  afterEach(disableCache);

  const { communityId } = communityUser11;
  const { userId } = communityUser11;

  const preparedPayload = prepareMembershipPayload(resolvedCommunityValue.data, 'communityUsers');
  const { communityUsers: expectedUser } = preparedPayload;

  // integration_test_id: bee19fd4-63f4-403f-9771-6424d94cf144
  test('it should return banned members', async () => {
    client.http.put = jest.fn().mockResolvedValue(resolvedCommunityValue);

    const { data: recieved } = await unbanMembers(communityId, [userId]);

    expect(recieved).toStrictEqual(expectedUser);
  });

  test('it should update cache', async () => {
    client.http.put = jest.fn().mockResolvedValue(resolvedCommunityValue);

    await unbanMembers(communityId, [userId]);
    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({ communityId, userId }),
    ])?.data;

    expect([recieved]).toStrictEqual(expectedUser);
  });

  // integration_test_id: 22ce5ced-641a-48e2-9a89-d3f51119d8ac
  test('it should throw valid error', async () => {
    const err = new ASCError(
      'Permission Denied',
      Amity.ServerError.UNAUTHORIZED,
      Amity.ErrorLevel.ERROR,
    );

    client.http.put = jest.fn().mockRejectedValue(err);

    await expect(unbanMembers(communityId, [userId])).rejects.toThrow(err);
  });
});
