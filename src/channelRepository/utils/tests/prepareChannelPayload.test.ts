import { disableCache, enableCache, pushToCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';
import {
  generateChannelMarker,
  connectClient,
  disconnectClient,
  generateRawChannel,
  generateRawChannelUser,
  convertChannelUserFromRaw,
} from '~/utils/tests';

import * as getChannelMarkers from '../../../marker/api/getChannelMarkers';
import { isUnreadCountSupport, MARKER_INCLUDED_CHANNEL_TYPE, prepareChannelPayload } from '..';

export const communityChannel: Amity.RawChannel = generateRawChannel({
  channelId: 'ch1',
  type: 'community',
});
export const liveChannel: Amity.RawChannel = generateRawChannel({
  channelId: 'ch2',
  type: 'live',
});
export const conversationChannel: Amity.RawChannel = generateRawChannel({
  channelId: 'ch3',
  type: 'conversation',
});

export const rawChannelUser = generateRawChannelUser();

export const channelUser = convertChannelUserFromRaw(rawChannelUser, undefined);

const channelMarker1 = generateChannelMarker({
  entityId: communityChannel.channelId,
  userId: 'user1',
});

const channelMarker2 = generateChannelMarker({
  entityId: conversationChannel.channelId,
  userId: 'user1',
});

const resolvedChannelMarkers: Amity.Cached<Amity.Paged<Amity.ChannelMarker>> = {
  data: [channelMarker1, channelMarker2],
  cachedAt: Date.now(),
};

const channelPayload: Amity.ChannelPayload = {
  channels: [communityChannel, liveChannel, conversationChannel],
  channelUsers: [rawChannelUser],
  users: [],
  files: [],
  messagePreviews: [],
};

const convertedChannelPayload: Amity.ProcessedChannelPayload = {
  channels: [
    {
      ...communityChannel,
      defaultSubChannelId: communityChannel._id,
      isUnreadCountSupport: true,
      unreadCount: channelMarker1.unreadCount,
      hasMentioned: channelMarker1.hasMentioned,
      isMentioned: channelMarker1.hasMentioned,
      messagePreviewId: undefined,
      subChannelsUnreadCount: channelMarker1.unreadCount,
    },
    {
      ...liveChannel,
      defaultSubChannelId: liveChannel._id,
      isUnreadCountSupport: false,
      unreadCount: 0,
      hasMentioned: false,
      isMentioned: false,
      messagePreviewId: undefined,
      subChannelsUnreadCount: 0,
    },
    {
      ...conversationChannel,
      defaultSubChannelId: conversationChannel._id,
      isUnreadCountSupport: true,
      unreadCount: channelMarker2.unreadCount,
      hasMentioned: channelMarker2.hasMentioned,
      isMentioned: channelMarker2.hasMentioned,
      messagePreviewId: undefined,
      subChannelsUnreadCount: channelMarker2.unreadCount,
    },
  ],
  channelUsers: [channelUser],
  users: [],
  files: [],
};

describe('prepareChannelPayload', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  it('should map channel payload with marker correctly', async () => {
    jest
      .spyOn(getChannelMarkers, 'getChannelMarkers')
      .mockResolvedValueOnce(resolvedChannelMarkers);

    const { channels: received } = await prepareChannelPayload(channelPayload);

    expect(received).toEqual(convertedChannelPayload.channels);
  });

  it('should map channel payload with marker cache correctly', async () => {
    pushToCache(['channelMarker', 'get', channelMarker1.entityId], channelMarker1);
    pushToCache(['channelMarker', 'get', channelMarker2.entityId], channelMarker2);

    const { channels: received } = await prepareChannelPayload(channelPayload);

    expect(received).toEqual(convertedChannelPayload.channels);
  });

  it('should map channel payload with `unreadCount: 0` on unable to fetch marker', async () => {
    const { channels: received } = await prepareChannelPayload(channelPayload);

    const expected = convertedChannelPayload.channels.map(c => ({ ...c, unreadCount: 0 }));

    expect(received).toEqual(expected);
  });

  it(`should filter channels by ${MARKER_INCLUDED_CHANNEL_TYPE.join(', ')} type(s)`, async () => {
    const mock = jest
      .spyOn(getChannelMarkers, 'getChannelMarkers')
      .mockResolvedValueOnce(resolvedChannelMarkers);

    await prepareChannelPayload(channelPayload);

    const expected = channelPayload.channels.filter(isUnreadCountSupport).map(c => c.channelId);

    expect(mock).toHaveBeenCalledWith(expected);
  });

  it('should not throw an error on `getChannelMarkers` failed', async () => {
    jest
      .spyOn(getChannelMarkers, 'getChannelMarkers')
      .mockRejectedValueOnce(new ASCApiError('error', 500, Amity.ErrorLevel.ERROR));

    await expect(prepareChannelPayload(channelPayload)).resolves.not.toThrow();
  });
});
