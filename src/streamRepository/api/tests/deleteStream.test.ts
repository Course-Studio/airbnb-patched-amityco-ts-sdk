import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';
import { client, connectClient, disconnectClient, streamResponse } from '~/utils/tests';

import { deleteStream } from '~/streamRepository/api';

const STREAM_ID = streamResponse.data.videoStreamings[0].streamId;

const resolvedDeleteValue = {
  data: {
    success: true,
  },
};

jest.mock('~/streamRepository/api/getStream', () => ({
  getStream: jest.fn(() => Promise.resolve(streamResponse.data.videoStreamings[0])),
}));

describe('deleteStream', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('should return deleted stream', async () => {
    client.http.delete = jest.fn().mockResolvedValueOnce(resolvedDeleteValue);

    await expect(deleteStream(STREAM_ID)).resolves.toEqual(true);
  });

  test('should throw an error if request fails', async () => {
    client.http.delete = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(deleteStream(STREAM_ID)).rejects.toThrow('error');
  });

  test('should update cache after deleted stream', async () => {
    enableCache();
    client.http.delete = jest.fn().mockResolvedValueOnce(resolvedDeleteValue);
    pushToCache(['community', 'get', STREAM_ID], streamResponse.data.videoStreamings[0]);

    await deleteStream(STREAM_ID);
    const recieved = pullFromCache(['stream', 'get', STREAM_ID])?.data;

    expect(recieved).toEqual(
      expect.objectContaining({
        isDeleted: true,
      }),
    );

    disableCache();
  });
});
