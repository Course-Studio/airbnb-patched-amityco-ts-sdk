import { disableCache, enableCache } from '~/cache/api';
import { getChannel } from '../getChannel';

import * as getChannelMarkers from '../../../marker/api/getChannelMarkers';

import {
  client,
  connectClient,
  convertRawChannelPayload,
  disconnectClient,
  pause,
  channelQueryResponseWithMessagePreview,
  generateRawChannel,
  convertChannelFromRaw,
  generateRawMessage,
  generateRawSubChannel,
  user11,
  date,
  channelGetResponseWithMessagePreview,
  channelGetResponseWithNoMessagePreview,
} from '~/utils/tests';
import { getChannelMessagePreviewWithUser } from '~/messagePreview/utils';

import * as getMessagePreviewSetting from '~/client/utils/messagePreviewEngine';

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.Channel[],
    loading: true,
    ...params,
  };
};

const rawMessage = generateRawMessage({
  channelId: 'channelId11',
  channelPublicId: 'channelId11',
  messageFeedId: 'channelId11',
  messageId: 'messageId1',
  creatorId: 'test',
  creatorPublicId: 'test',
});

const rawNewCreatedMessage = generateRawMessage({
  channelId: 'channelId11',
  channelPublicId: 'channelId11',
  messageFeedId: 'channelId11',
  messageId: 'messageId2',
  creatorId: 'test',
  creatorPublicId: 'test',
});

const rawNewChannelWithMessagePreview = generateRawChannel({
  type: 'conversation',
  messagePreviewId: 'messageId2',
});

const rawSubChannel = generateRawSubChannel({
  channelId: 'channelId11',
  messageFeedId: 'channelId11',
  messagePreviewId: 'messageId2',
  name: 'subChannel1',
});

const messagePreviewFromResponse = channelGetResponseWithMessagePreview.data.messagePreviews[0];
const messageFeedsInfoFromResponse = channelGetResponseWithMessagePreview.data.messageFeedsInfo[0];

const messagePreview = {
  channelId: messagePreviewFromResponse.channelPublicId,
  subChannelId: messagePreviewFromResponse.messageFeedId,
  dataType: messagePreviewFromResponse.dataType,
  isDeleted: messagePreviewFromResponse.isDeleted,
  segment: messagePreviewFromResponse.segment,
  creatorId: messagePreviewFromResponse.creatorPublicId,
  createdAt: messagePreviewFromResponse.createdAt,
  data: messagePreviewFromResponse.data,
  updatedAt: messagePreviewFromResponse.updatedAt!,
  subChannelName: messageFeedsInfoFromResponse.name!,
  subChannelUpdatedAt: messageFeedsInfoFromResponse.updatedAt!,
  messagePreviewId: messageFeedsInfoFromResponse.messagePreviewId!,
  user: user11,
};

const newMessagePreview = {
  channelId: rawNewCreatedMessage.channelId,
  creatorId: rawNewCreatedMessage.creatorPublicId,
  messagePreviewId: rawNewCreatedMessage.messageId,
  createdAt: rawNewCreatedMessage.createdAt,
  updatedAt: rawNewCreatedMessage.updatedAt,
  data: rawNewCreatedMessage.data,
  dataType: rawNewCreatedMessage.dataType,
  isDeleted: rawNewCreatedMessage.isDeleted,
  segment: rawNewCreatedMessage.segment,
  subChannelId: rawSubChannel.messageFeedId,
  subChannelName: rawSubChannel.name,
  subChannelUpdatedAt: rawSubChannel.updatedAt!,
  user: user11,
};

const rawUpdatedMessage: Amity.RawMessage = {
  ...rawMessage,
  createdAt: messagePreviewFromResponse.createdAt,
  data: {
    text: 'updated',
  },
  updatedAt: date,
};

const rawDeletedMessage: Amity.RawMessage = {
  ...rawMessage,
  createdAt: messagePreviewFromResponse.createdAt,
  data: {
    text: 'updated',
  },
  isDeleted: true,
  updatedAt: date,
};

const updatedMessagePreview = {
  ...messagePreview,
  data: rawUpdatedMessage.data,
  updatedAt: rawUpdatedMessage.updatedAt,
};

const deletedMessagePreview = {
  ...updatedMessagePreview,
  isDeleted: true,
};

const rawUpdatedSubChannel = {
  ...rawSubChannel,
  name: 'subChannel1-edit',
  updatedAt: date,
};

const rawDeletedSubChannel = {
  ...rawSubChannel,
  isDeleted: true,
  updatedAt: date,
};

const updatedSubChannelMessagePreview = {
  ...messagePreview,
  subChannelName: rawUpdatedSubChannel.name,
  updatedAt: rawUpdatedSubChannel.updatedAt,
};

describe('getChannels with MessagePreview', () => {
  jest.spyOn(getChannelMarkers, 'getChannelMarkers').mockResolvedValue({
    data: [],
    cachedAt: undefined,
  });

  describe('Message Preview include delete', () => {
    beforeAll(() => {
      jest
        .spyOn(getMessagePreviewSetting, 'getMessagePreviewSetting')
        .mockResolvedValue(Amity.MessagePreviewSetting.MESSAGE_PREVIEW_INCLUDE_DELETED);

      connectClient();
    });

    afterAll(() => {
      disconnectClient();
      jest.clearAllMocks();
    });

    beforeEach(enableCache);
    afterEach(disableCache);

    describe('getChannel', () => {
      test('it should return channel live object with message preview', async () => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(channelGetResponseWithMessagePreview);

        getChannel(channelGetResponseWithMessagePreview.data.channels[0].channelId, callback);
        await pause();

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining(
            getSnapshot({
              data: undefined,
            }),
          ),
        );
        expect(callback).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining(
            getSnapshot({
              data: getChannelMessagePreviewWithUser(
                convertRawChannelPayload(channelGetResponseWithMessagePreview.data).channels[0],
              ),
              loading: false,
            }),
          ),
        );
      });
    });

    describe('events', () => {
      beforeAll(() => {
        client.getMessagePreviewSetting = jest
          .fn()
          .mockResolvedValue(Amity.MessagePreviewSetting.MESSAGE_PREVIEW_INCLUDE_DELETED);
      });

      const cases: [string, keyof Amity.Events, ValueOf<Amity.Events>, Amity.Channel][] = [
        [
          'it should update message preview to live object onMessageCreated',
          'message.created',
          {
            messages: [rawNewCreatedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
          {
            ...convertChannelFromRaw(rawNewChannelWithMessagePreview),
            // TODO: fix channel live object to return lastActivity as createdAt field of a new message
            lastActivity: channelGetResponseWithMessagePreview.data.channels[0].lastActivity,
            messagePreview: newMessagePreview,
          },
        ],
        [
          'it should update message preview to live object onMessageUpdated',
          'message.updated',
          {
            messages: [rawUpdatedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
          {
            ...convertChannelFromRaw(rawNewChannelWithMessagePreview),
            lastActivity: channelQueryResponseWithMessagePreview.data.channels[0].lastActivity,
            messagePreviewId: updatedMessagePreview.messagePreviewId,
            messagePreview: updatedMessagePreview,
          },
        ],
        [
          'it should update message preview to live object onMessageDeleted',
          'message.deleted',
          {
            messages: [rawDeletedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
          {
            ...convertChannelFromRaw(rawNewChannelWithMessagePreview),
            lastActivity: channelQueryResponseWithMessagePreview.data.channels[0].lastActivity,
            messagePreviewId: deletedMessagePreview.messagePreviewId,
            messagePreview: deletedMessagePreview,
          },
        ],
        [
          'it should update message preview to live object onSubChannelUpdated',
          'message-feed.updated',
          {
            messageFeeds: [rawUpdatedSubChannel],
            messages: [],
            users: [],
            files: [],
          },
          {
            ...convertRawChannelPayload(channelGetResponseWithMessagePreview.data).channels[0],
            messagePreviewId: updatedSubChannelMessagePreview.messagePreviewId,
            messagePreview: updatedSubChannelMessagePreview,
          },
        ],
        [
          'it should update message preview to live object onSubChannelDeleled',
          'message-feed.deleted',
          {
            messageFeeds: [rawDeletedSubChannel],
            messages: [],
            users: [],
            files: [],
          },

          {
            ...convertRawChannelPayload(channelGetResponseWithNoMessagePreview.data).channels[0],
            messagePreview: null,
          },
        ],
      ];

      test.each(cases)('%s', async (test, event, eventPayload, expected) => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(channelGetResponseWithMessagePreview);

        getChannel(channelGetResponseWithMessagePreview.data.channels[0].channelId, callback);
        await pause();

        if (event === 'message-feed.deleted') {
          // eslint-disable-next-line require-atomic-updates
          client.http.get = jest.fn().mockResolvedValue(channelGetResponseWithNoMessagePreview);

          await pause();
        }

        client.emitter.emit(event, eventPayload);
        await pause();
        expect(callback).toHaveBeenCalledTimes(3);

        expect(callback).toHaveBeenNthCalledWith(
          3,
          expect.objectContaining(
            getSnapshot({
              data: expected,
              loading: false,
              origin: 'event',
            }),
          ),
        );
      });
    });
  });

  describe('Message Preview not include delete', () => {
    beforeAll(() => {
      jest
        .spyOn(getMessagePreviewSetting, 'getMessagePreviewSetting')
        .mockResolvedValue(Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED);

      connectClient();
    });

    afterAll(() => {
      disconnectClient();
      jest.clearAllMocks();
    });

    beforeEach(enableCache);
    afterEach(disableCache);

    describe('events', () => {
      beforeAll(() => {
        client.getMessagePreviewSetting = jest
          .fn()
          .mockResolvedValue(Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED);
      });

      const cases: [string, keyof Amity.Events, ValueOf<Amity.Events>, Amity.Channel][] = [
        [
          'it should update message preview to live object onMessageCreated',
          'message.created',
          {
            messages: [rawNewCreatedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
          {
            ...convertChannelFromRaw(rawNewChannelWithMessagePreview),
            // TODO: fix channel live object to return lastActivity as createdAt field of a new message
            lastActivity: channelGetResponseWithMessagePreview.data.channels[0].lastActivity,
            messagePreview: newMessagePreview,
          },
        ],
        [
          'it should update message preview to live object onMessageUpdated',
          'message.updated',
          {
            messages: [rawUpdatedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
          {
            ...convertChannelFromRaw(rawNewChannelWithMessagePreview),
            lastActivity: channelQueryResponseWithMessagePreview.data.channels[0].lastActivity,
            messagePreviewId: updatedMessagePreview.messagePreviewId,
            messagePreview: updatedMessagePreview,
          },
        ],
        [
          'it should update message preview to live object onMessageDeleted',
          'message.deleted',
          {
            messages: [rawDeletedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
          {
            ...convertRawChannelPayload(channelGetResponseWithNoMessagePreview.data).channels[0],
            messagePreview: null,
          },
        ],
        [
          'it should update message preview to live object onSubChannelUpdated',
          'message-feed.updated',
          {
            messageFeeds: [rawUpdatedSubChannel],
            messages: [],
            users: [],
            files: [],
          },
          {
            ...convertRawChannelPayload(channelGetResponseWithMessagePreview.data).channels[0],
            messagePreviewId: updatedSubChannelMessagePreview.messagePreviewId,
            messagePreview: updatedSubChannelMessagePreview,
          },
        ],
        [
          'it should update message preview to live object onSubChannelDeleled',
          'message-feed.deleted',
          {
            messageFeeds: [rawDeletedSubChannel],
            messages: [],
            users: [],
            files: [],
          },

          {
            ...convertRawChannelPayload(channelGetResponseWithNoMessagePreview.data).channels[0],
            messagePreview: null,
          },
        ],
      ];

      test.each(cases)('%s', async (test, event, eventPayload, expected) => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(channelGetResponseWithMessagePreview);

        getChannel(channelGetResponseWithMessagePreview.data.channels[0].channelId, callback);
        await pause();

        if (event === 'message.deleted' || event === 'message-feed.deleted') {
          // eslint-disable-next-line require-atomic-updates
          client.http.get = jest.fn().mockResolvedValue(channelGetResponseWithNoMessagePreview);

          await pause();
        }

        client.emitter.emit(event, eventPayload);
        await pause();
        expect(callback).toHaveBeenCalledTimes(3);

        expect(callback).toHaveBeenNthCalledWith(
          3,
          expect.objectContaining(
            getSnapshot({
              data: expected,
              loading: false,
              origin: 'event',
            }),
          ),
        );
      });
    });
  });

  describe('No Message Preview', () => {
    beforeAll(() => {
      jest
        .spyOn(getMessagePreviewSetting, 'getMessagePreviewSetting')
        .mockResolvedValue(Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW);

      connectClient();
    });

    afterAll(() => {
      disconnectClient();
      jest.clearAllMocks();
    });

    beforeEach(enableCache);
    afterEach(disableCache);

    describe('events', () => {
      beforeAll(() => {
        client.getMessagePreviewSetting = jest
          .fn()
          .mockResolvedValue(Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW);
      });

      const cases: [string, keyof Amity.Events, ValueOf<Amity.Events>][] = [
        [
          'it should update message preview to live object onMessageCreated',
          'message.created',
          {
            messages: [rawNewCreatedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
        ],
        [
          'it should update message preview to live object onMessageUpdated',
          'message.updated',
          {
            messages: [rawUpdatedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
        ],
        [
          'it should update message preview to live object onMessageDeleted',
          'message.deleted',
          {
            messages: [rawDeletedMessage],
            messageFeeds: [rawSubChannel],
            users: [],
            files: [],
            reactions: [],
          },
        ],
        [
          'it should update message preview to live object onSubChannelUpdated',
          'message-feed.updated',
          {
            messageFeeds: [rawUpdatedSubChannel],
            messages: [],
            users: [],
            files: [],
          },
        ],
        [
          'it should update message preview to live object onSubChannelDeleled',
          'message-feed.deleted',
          {
            messageFeeds: [rawDeletedSubChannel],
            messages: [],
            users: [],
            files: [],
          },
        ],
      ];

      test.each(cases)('%s', async (test, event, eventPayload) => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(channelGetResponseWithNoMessagePreview);

        getChannel(channelGetResponseWithNoMessagePreview.data.channels[0].channelId, callback);
        await pause();

        client.emitter.emit(event, eventPayload);
        await pause();

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining(
            getSnapshot({
              data: undefined,
            }),
          ),
        );
        expect(callback).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining(
            getSnapshot({
              data: getChannelMessagePreviewWithUser(
                convertRawChannelPayload(channelGetResponseWithNoMessagePreview.data).channels[0],
              ),
              loading: false,
            }),
          ),
        );
      });
    });
  });
});
