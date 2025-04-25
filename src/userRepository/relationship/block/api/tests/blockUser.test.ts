import { blockUser } from '~/userRepository/relationship';
import { client, user12 } from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { generateBlockResult } from '~/utils/tests/dummy/block';

const BlockSuccessPayload = generateBlockResult(user12, 'blocked');

describe('blockUser', () => {
  // integration_test_id: 2eaac2bf-cfc5-43a6-b3cb-7b1f90747429
  it('should return success', async () => {
    client.http.post = jest.fn().mockResolvedValue(BlockSuccessPayload);
    const data = await blockUser('Android2');
    expect(data).toEqual(BlockSuccessPayload.data);
  });

  // integration_test_id: d88d68e3-218f-4974-a25f-10695b4d9089
  it('should return error 400000 when user try to block blocked user', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError(
          'You have already blocked this user',
          Amity.ServerError.BAD_REQUEST,
          Amity.ErrorLevel.ERROR,
        ),
      );

    await expect(blockUser('Android2')).rejects.toThrow(
      'Amity SDK (400000): You have already blocked this user',
    );
  });
});
