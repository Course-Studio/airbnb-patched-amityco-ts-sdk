import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { prepareMembershipPayload } from '~/group/utils';
import { getResolver } from '~/core/model';
import { ASCError } from '~/core/errors';

import { client, community11, communityUser11, user11 } from '~/utils/tests';

import { banMembers } from '../banMembers';

const userCommunity = community11;
const user = {
  ...communityUser11,
  communityMebership: 'banned',
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

describe('community/ moderation/ banMembers', () => {
  beforeEach(enableCache);
  afterEach(disableCache);

  const { communityId } = communityUser11;
  const { userId } = communityUser11;

  const preparedPayload = prepareMembershipPayload(resolvedCommunityValue.data, 'communityUsers');
  const { communityUsers: expectedUser } = preparedPayload;

  // integration_test_id: d344e314-4a49-4947-b4d5-8fa2d55f8ecd
  test('it should return banned members', async () => {
    client.http.put = jest.fn().mockResolvedValue(resolvedCommunityValue);

    const { data: recieved } = await banMembers(communityId, [userId]);

    expect(recieved).toStrictEqual(expectedUser);
  });

  test('it should update cache', async () => {
    client.http.put = jest.fn().mockResolvedValue(resolvedCommunityValue);

    await banMembers(communityId, [userId]);
    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({ communityId, userId }),
    ])?.data;

    expect([recieved]).toStrictEqual(expectedUser);
  });

  // integration_test_id: 59b58ec8-8380-49b2-aa39-6da361692c2e
  test('it should throw valid error', async () => {
    const err = new ASCError(
      'Permission Denied',
      Amity.ServerError.UNAUTHORIZED,
      Amity.ErrorLevel.ERROR,
    );

    client.http.put = jest.fn().mockRejectedValue(err);

    await expect(banMembers(communityId, [userId])).rejects.toThrow(err);
  });
});
