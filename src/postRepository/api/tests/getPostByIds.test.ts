import { client, connectClient, disconnectClient, post11, post12 } from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { getPostByIds } from '~/postRepository/api/getPostByIds';

describe('getPostByIds', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('Should return Error: 400400 when getPostByIds from invalid postId', async () => {
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getPostByIds([post11.postId, post12.postId])).rejects.toThrow();
  });
});
