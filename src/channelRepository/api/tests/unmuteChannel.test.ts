import { ASCError } from '~/core/errors';
import { connectClient, disconnectClient, client } from '~/utils/tests';

import { unmuteChannel } from '../unmuteChannel';

describe('unmuteChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id:
  test('it should return a success response', async () => {
    client.http.put = jest.fn().mockResolvedValue({ data: { success: true } });

    await expect(unmuteChannel('channel-id')).resolves.toBe(true);
  });

  // integration_test_id:
  test('it should return 400400 on invalid channel id', async () => {
    const err = new ASCError(
      'Invalid Channel Id',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.put = jest.fn().mockRejectedValue(err);

    await expect(unmuteChannel('channel-id')).rejects.toBe(err);
  });
});
