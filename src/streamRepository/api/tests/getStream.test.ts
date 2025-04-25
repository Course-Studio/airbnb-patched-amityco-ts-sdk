import { enableCache } from '~/cache/api';
import { client, connectClient, disconnectClient, streamResponse } from '~/utils/tests';
import { getStream } from '~/streamRepository/internalApi/getStream';

const STREAM_ID = streamResponse.data.videoStreamings[0].streamId;

describe('getStream', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('Should return the stream from backend', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValueOnce(streamResponse);
    const { data } = await getStream(STREAM_ID);
    expect(data).toEqual(streamResponse.data.videoStreamings[0]);
  });

  test('Should return stream from locally', async () => {
    const stream: ReturnType<typeof getStream.locally> = getStream.locally(STREAM_ID);

    expect(stream?.data).toEqual(streamResponse.data.videoStreamings[0]);
  });
});
