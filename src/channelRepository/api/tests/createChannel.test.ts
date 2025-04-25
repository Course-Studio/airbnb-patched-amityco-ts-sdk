import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import {
  channelPayload,
  client,
  connectClient,
  conversationChannelPayload,
  convertRawChannelPayload,
  disconnectClient,
  liveChannelPayload,
  rawChannelPayload,
} from '~/utils/tests';

import { createChannel } from '../createChannel';

const resPayload = { data: rawChannelPayload };

describe('createChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: 9d80fd54-9e6d-454d-8344-6f9436b8e495
  test('it should create a channel for community', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(resPayload);

    const {
      channels: [expected],
    } = convertRawChannelPayload(rawChannelPayload);

    const res = await createChannel({ type: 'community' });

    expect(res).toBeDefined();
    expect(res.data).toStrictEqual(expected);
  });

  // integration_test_id: cef520ab-027d-4c5b-836c-a7f63ddc5146
  test('it should create a channel for live', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce({ data: liveChannelPayload });

    const {
      channels: [expected],
    } = convertRawChannelPayload(liveChannelPayload);

    const res = await createChannel({ type: 'live' });

    expect(res).toBeDefined();
    expect(res.data).toStrictEqual(expected);
  });

  // integration_test_id: 11a43612-ff6f-4262-874c-4419d342cff1
  test('it should create a channel for conversation', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce({ data: conversationChannelPayload });

    const {
      channels: [expected],
    } = convertRawChannelPayload(conversationChannelPayload);

    const res = await createChannel({ type: 'conversation' });

    expect(res).toBeDefined();
    expect(res.data).toStrictEqual(expected);
  });

  test('it should add channel to cache', async () => {
    enableCache();

    client.http.post = jest.fn().mockResolvedValueOnce(resPayload);
    const { channelId } = channelPayload.channels[0];

    const {
      channels: [expected],
    } = convertRawChannelPayload(rawChannelPayload);

    await createChannel({ type: 'community' });
    const data = pullFromCache(['channel', 'get', channelId]);

    expect(data).toBeDefined();
    expect(data?.data).toStrictEqual(expected);

    disableCache();
  });

  test('it should call conversation channel with /conversation api', async () => {
    const mockFn = jest.fn();
    client.http.post = mockFn.mockResolvedValueOnce(resPayload);
    const expected = '/api/v3/channels/conversation';
    const expectedPayload = { type: 'conversation', isDistinct: true };

    await createChannel({ type: 'conversation' });
    const [received, receivedPayload] = mockFn.mock.lastCall;

    expect(received).toBe(expected);
    expect(receivedPayload).toStrictEqual(expectedPayload);
  });

  test('it should return an error', async () => {
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(createChannel({ type: 'conversation' })).rejects.toThrow('error');
  });
});
