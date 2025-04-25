import {
  channelQueryResponse,
  client,
  connectClient,
  convertRawChannelPayload,
  disconnectClient,
  pause,
} from '~/utils/tests';
import { getChannel } from '../getChannel';

describe('getChannel (observer)', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('When user gets valid channel, it should return valid channel', async () => {
    const callback = jest.fn();
    const { channelId } = channelQueryResponse.data.channels[0];

    client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);

    getChannel(channelId, callback);

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: undefined,
        loading: true,
        error: undefined,
      }),
    );

    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: {
          ...convertRawChannelPayload(channelQueryResponse.data).channels[0],
          messagePreview: null,
        },
        loading: false,
        error: undefined,
      }),
    );
  });

  test('When user queries invalid channel, it should return error', async () => {
    const callback = jest.fn();

    client.http.get = jest.fn().mockRejectedValue(new Error('error'));

    getChannel('xxxxxx', callback);

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: undefined,
        loading: true,
        error: undefined,
      }),
    );

    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: undefined,
        loading: false,
        error: new Error('error'),
      }),
    );
  });
});
