import { client, user12, user13 } from '~/utils/tests';
import { queryBlockedUsers } from '~/userRepository/api/queryBlockedUsers';
import { disableCache, enableCache } from '~/cache/api';
import { generateBlockedUsers } from '~/utils/tests/dummy/block';

const BlockedUsersPayload = generateBlockedUsers(user12, user13);

const BlockedUserEmptyList = generateBlockedUsers();

describe('queryBlockedUsers', () => {
  // integration_test_id: 5ac964db-43c9-459f-8bcf-2fd034a62907
  it('should return a list of blocked users', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(BlockedUsersPayload);
    const { data } = await queryBlockedUsers();
    expect(data).toEqual(BlockedUsersPayload.data.users);
    disableCache();
  });

  // integration_test_id: f9133599-0aa5-438d-bd69-7231ca64232a
  it('should return an empty list of blocked users', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(BlockedUserEmptyList);
    const { data } = await queryBlockedUsers();
    expect(data).toEqual(BlockedUserEmptyList.data.users);
    disableCache();
  });
});
