import { enableCache } from '~/cache/api';
import { client, connectClient, disconnectClient, pause, streamResponse } from '~/utils/tests';
import { getStreamById } from '../getStreamById';

const STREAM_ID = streamResponse.data.videoStreamings[0].streamId;

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: undefined as undefined | Amity.InternalStream,
    loading: true,
    error: undefined as any,
    ...params,
  };
};

describe('getStreamById', () => {
  beforeAll(async () => {
    await connectClient();
  });
  afterAll(async () => {
    await disconnectClient();
  });

  test('Should return the stream from backend', async () => {
    enableCache();
    const snapshot = getSnapshot();
    const update = getSnapshot({ data: streamResponse.data.videoStreamings[0], loading: false });

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(streamResponse);

    getStreamById(STREAM_ID, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(snapshot));
    expect(callback).toHaveBeenNthCalledWith(2, expect.objectContaining(update));
  });

  test('Should return stream from locally', async () => {
    const stream: ReturnType<typeof getStreamById.locally> = getStreamById.locally(STREAM_ID);
    expect(stream?.data).toEqual(streamResponse.data.videoStreamings[0]);
  });
});
