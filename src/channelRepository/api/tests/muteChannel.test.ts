import { ASCError } from '~/core/errors';
import { connectClient, disconnectClient, client } from '~/utils/tests';

import { muteChannel } from '../muteChannel';

describe('muteChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: 3249c470-60ab-4f1a-bdaf-48c6714dff3b
  test('it should return a success response', async () => {
    client.http.put = jest.fn().mockResolvedValue({ data: { success: true } });

    await expect(muteChannel('channel-id', 100)).resolves.toBe(true);
  });

  // integration_test_id: bc676809-1817-4dab-ae7e-d00c19d6bf37
  test('it should return 400400 on invalid channel id', async () => {
    const err = new ASCError(
      'Invalid Channel Id',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.put = jest.fn().mockRejectedValue(err);

    await expect(muteChannel('channel-id', 100)).rejects.toBe(err);
  });

  test('it should throw error if mute period less than 0 and not -1', async () => {
    const err = new ASCError(
      'Mute Period can only be positive numbers or -1(mute forever)',
      Amity.ClientError.INVALID_PARAMETERS,
      Amity.ErrorLevel.ERROR,
    );

    client.http.put = jest.fn().mockRejectedValue(err);

    await expect(muteChannel('channel-id', 100)).rejects.toBe(err);
  });
});
