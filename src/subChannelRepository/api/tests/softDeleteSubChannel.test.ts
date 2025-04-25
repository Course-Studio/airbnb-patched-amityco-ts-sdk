import { client, connectClient, disconnectClient, generateRawSubChannel } from '~/utils/tests';
import { disableCache, enableCache } from '~/cache/api';

import { softDeleteSubChannel } from '../softDeleteSubChannel';

describe('softDeleteSubChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  /*
   * this is the only test required as the rest are tested in
   * deleteSubChannel.test.ts
   */
  test('it should call the api with the correct param', async () => {
    const mockApi = jest.fn().mockResolvedValue({ data: {} });
    const rawSubChannel = generateRawSubChannel();
    const expected = { params: { permanent: false } };

    // mock get sub channel
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });
    client.http.delete = mockApi;

    await softDeleteSubChannel('sub-channel-id');

    const recieved = mockApi.mock.lastCall[1];

    expect(recieved).toStrictEqual(expected);
  });
});
