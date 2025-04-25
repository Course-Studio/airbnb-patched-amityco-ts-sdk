import { client, user11, user12 } from '~/utils/tests';
import { getFollowInfo } from '~/userRepository/relationship/follow/api/getFollowInfo';
import { generateBlockResult, generateFollowCount } from '~/utils/tests/dummy/block';

const FollowCountPayload = generateFollowCount(user11);

const UserRelationPayload = generateBlockResult(user12, 'blocked');

describe('getFollowInfo', () => {
  // integration_test_id: 09d150b5-350e-46de-8c0d-548b497ee01c
  it('should return a list from relation', async () => {
    client.http.get = jest.fn().mockResolvedValue(UserRelationPayload);
    const { data } = await getFollowInfo('Android2');
    expect(data).toEqual({
      status: 'blocked',
      ...FollowCountPayload,
    });
  });
});
