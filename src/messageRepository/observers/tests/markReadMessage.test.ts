import {
  client,
  generateMessageMarker,
  generateRawChannel,
  generateRawMessage,
  messages,
  pause,
  generateRawSubChannel,
} from '~/utils/tests';
import { getMessages } from '../getMessages';
import { getChannels } from '~/channelRepository/observers/getChannels';

import { enableUnreadCount } from '~/client';

import ReadReceiptSyncEngine from '~/client/utils/ReadReceiptSync/readReceiptSyncEngine';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { pushToCache } from '~/cache/api';

describe('readReceiptSyncEngine', () => {
  const channelsReturn: Amity.ChannelPayload = {
    channels: [generateRawChannel({ channelId: 'channel-id' })],
    channelUsers: [],
    messagePreviews: [],
    messageFeedsInfo: [],
    users: [],
    files: [],
  };

  const channelMarkerReturn: Amity.ChannelMarkerPayload = {
    userEntityMarkers: [],
    userMarkers: [],
  };

  const messageReturn: Amity.MessagePayload = {
    messages: [
      generateRawMessage({
        messageId: messages.page1[0],
        messageFeedId: 'channel-id',
        channelId: 'channel-id',
      }),
    ],
    messageFeeds: [],
    reactions: [],
    users: [],
    files: [],
  };

  const messasgeMarkersReturn: Amity.MessageMarkerPayload = {
    contentMarkers: [
      generateMessageMarker({
        contentId: messages.page1[0],
        feedId: messageReturn.messages[0].messageFeedId,
        creatorId: messageReturn.messages[0].creatorId,
      }),
    ],
    feedMarkers: [],
    userMarkers: [],
  };

  const userMessageFeedMarkersReturn: Amity.UserMessageFeedMarkerPayload = {
    feedMarkers: [
      {
        feedId: 'channel-id',
        entityId: 'channel-id',
        lastSegment: 0,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    userFeedMarkers: [
      {
        userId: 'user-id',
        entityId: 'channel-id',
        feedId: 'channel-id',
        readToSegment: 0,
        deliveredToSegment: 0,
        unreadCount: 0,
        oldUnreadCount: 0,
        lastMentionSegment: 0,
        isMentioned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
  const { subChannelId } = messages;

  const rawNewMessage = generateRawMessage({
    messageId: 'new-message-id',
    messageFeedId: 'channel-id',
    channelPublicId: 'channel-id',
    channelId: 'channel-id',
  });

  client.use();
  client.http.get = jest.fn().mockImplementation(params => {
    if (params.includes('/api/v5/messages')) return { data: { ...messageReturn } };
    if (params.includes('/api/v3/channels')) return { data: { ...channelsReturn } };
    if (params.includes('/api/v1/markers/user-message-feed'))
      return { data: { ...userMessageFeedMarkersReturn } };
    if (params.includes('/api/v1/markers/channels'))
      return {
        data: { ...channelMarkerReturn },
      };
    if (params.includes('/api/v1/markers/messages'))
      return {
        data: { ...messasgeMarkersReturn },
      };
    return { data: {} };
  });

  it('should increase unreadCount when a message is received', async () => {
    enableUnreadCount();

    const callbackChannels = jest.fn();

    getChannels({}, callbackChannels);

    await pause();

    client.emitter.emit('message.created', {
      messages: [rawNewMessage],
      messageFeeds: [
        {
          ...generateRawSubChannel({
            channelId: channelsReturn.channels[0].channelId,
            messageFeedId: channelsReturn.channels[0].channelId,
            name: 'general',
          }),
        },
      ],
      users: [],
      files: [],
      reactions: [],
    });

    await pause();

    expect(callbackChannels.mock.calls[2][0].data[0].unreadCount).toBe(1);
    expect(callbackChannels.mock.calls[2][0].data[0].subChannelsUnreadCount).toBe(1);
  });

  it('should mark a message as read', async () => {
    const readReceiptSyncEngine = ReadReceiptSyncEngine.getInstance();

    readReceiptSyncEngine.startSyncReadReceipt();

    const spyPut = jest.spyOn(client.http, 'put').mockResolvedValue({});
    const callback = jest.fn();

    getMessages({ subChannelId }, callback);

    callback.mock.calls[1][0].data[0].markRead();

    await pause(2000);

    expect(spyPut).toHaveBeenCalledWith(`/api/v1/markers/message-feeds/${subChannelId}/mark-read`, {
      readToSegment: 1,
    });

    readReceiptSyncEngine.onSessionDestroyed();

    client.emitter.emit('message.created', {
      messages: [rawNewMessage],
      messageFeeds: [
        {
          ...generateRawSubChannel({
            channelId: channelsReturn.channels[0].channelId,
            messageFeedId: channelsReturn.channels[0].channelId,
            name: 'general',
          }),
        },
      ],
      users: [],
      files: [],
      reactions: [],
    });
  });

  it.only('should increase message readCount when a message is marked as read', async () => {
    const callback = jest.fn();
    getMessages({ subChannelId: 'channel-id' }, callback);

    pushToCache(['messageMarker', 'get', 'channel-id#message11#user-id'], {
      feedId: 'channel-id',
      contentId: 'message11',
      creatorId: 'user-id',
      readCount: 0,
      deliveredCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await pause();

    client.emitter.emit('marker.marked-message', {
      contentMarkers: [
        {
          feedId: 'channel-id',
          contentId: 'message11',
          creatorId: 'user-id',
          readCount: 1,
          deliveredCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      feedMarkers: [
        {
          feedId: 'channel-id',
          entityId: 'channel-id',
          lastSegment: 1,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    await pause();

    expect(callback.mock.calls[2][0].data[0].readCount).toBe(1);
  });
});
