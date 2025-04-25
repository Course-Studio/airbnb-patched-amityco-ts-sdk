import { getResolver } from '~/core/model';

import { disableCache, enableCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import {
  client,
  channelQueryResponse,
  channelTagQueryResponse,
  channelExcludeTagQueryResponse,
  convertRawChannelPayload,
  connectClient,
  disconnectClient,
} from '~/utils/tests';

import { queryChannels } from '../queryChannels';

describe('queryChannels', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: 06c14dab-4799-4f26-9e52-be7c12b3bdb3
  test('it should return channels', async () => {
    const { channels: expected } = convertRawChannelPayload(channelQueryResponse.data);
    client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);

    const { data } = await queryChannels();

    expect(data).toEqual(expected);
  });

  // integration_test_id: 253fb0ac-f868-4570-9b1e-98b08861aa53
  test('it should return channels match with membership type', async () => {
    // Actually there is no any flag to tell about this list is relate to membership type
    // But need to implement this case to match with our test list
    const { channels: expected } = convertRawChannelPayload(channelQueryResponse.data);
    client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);

    const { data } = await queryChannels({ membership: 'member' });

    expect(data).toEqual(expected);
  });

  // integration_test_id: 92329d41-9403-44e7-979f-ed227e6ab120
  test('it should return channels match with tags query type', async () => {
    const { channels: expected } = convertRawChannelPayload(channelTagQueryResponse.data);
    client.http.get = jest.fn().mockResolvedValue(channelTagQueryResponse);

    const { data } = await queryChannels({ tags: ['tag1'] });

    expect(data).toEqual(expected);
    expect(data[0].tags).toContain('tag1');
  });

  // integration_test_id: 5249778c-6d99-4e2f-9b80-2f4ea6ae1833
  test('it should return channels without tags which defined in exclude options', async () => {
    const { channels: expected } = convertRawChannelPayload(channelExcludeTagQueryResponse.data);
    client.http.get = jest.fn().mockResolvedValue(channelExcludeTagQueryResponse);

    const { data } = await queryChannels({ excludeTags: ['tag1'] });
    expect(data).toEqual(expected);

    data.forEach(item => {
      expect(item.tags).not.toContain('tag1');
    });
  });

  test('it should throw error', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(queryChannels()).rejects.toThrow('error');
  });
});
