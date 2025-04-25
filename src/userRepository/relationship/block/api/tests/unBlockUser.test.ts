import { client, user12 } from '~/utils/tests';
import { unBlockUser } from '~/userRepository/relationship';
import { ASCApiError } from '~/core/errors';
import { generateBlockResult } from '~/utils/tests/dummy/block';

const UnblockSuccessPayload = generateBlockResult(user12, 'none');
describe('unblockUser', () => {
  // integration_test_id: 9c5d893c-4fc8-4e5d-a5b4-d72e69ac2fba
  it('should return success', async () => {
    client.http.delete = jest.fn().mockResolvedValue(UnblockSuccessPayload);
    const data = await unBlockUser('Android2');
    expect(data).toEqual(UnblockSuccessPayload.data);
  });

  // integration_test_id: 6fd89592-1a5c-48b0-b419-ee8f51395334
  it('should return error 400000 when unblock non-block user', async () => {
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError(
          'You have not block this user yet',
          Amity.ServerError.BAD_REQUEST,
          Amity.ErrorLevel.ERROR,
        ),
      );

    await expect(unBlockUser('Android2')).rejects.toThrow(
      'Amity SDK (400000): You have not block this user yet',
    );
  });
});
