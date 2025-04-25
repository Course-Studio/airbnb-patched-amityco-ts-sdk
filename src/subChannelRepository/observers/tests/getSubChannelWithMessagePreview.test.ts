import { disableCache, enableCache } from '~/cache/api';
import { getSubChannel } from '../getSubChannel';

import * as getSubChannelMarkers from '../../../marker/api/getSubChannelMarkers';

import {
  client,
  connectClient,
  disconnectClient,
  pause,
  generateRawMessage,
  generateRawSubChannel,
  user11,
  date,
  convertSubChannelFromRaw,
} from '~/utils/tests';
import { getSubChannelMessagePreviewWithUser } from '~/messagePreview/utils';
import * as getMessagePreviewSetting from '~/client/utils/messagePreviewEngine';

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.Channel[],
    loading: true,
    ...params,
  };
};

describe('getChannels with MessagePreview', () => {
  jest.spyOn(getSubChannelMarkers, 'getSubChannelMarkers').mockResolvedValue({
    data: [],
    cachedAt: undefined,
  });

  const rawSubChannel = generateRawSubChannel({
    channelId: 'channelId1',
    messagePreviewId: 'messageId1',
    messageFeedId: 'messageFeedId1',
  });

  const rawMessage = generateRawMessage({
    messageId: 'messageId1',
    channelId: 'channelId1',
    messageFeedId: 'messageFeedId1',
    creatorId: 'test',
    creatorPublicId: 'test',
  });

  const subChannelWithMessagePreviewGetResponse = {
    data: {
      messageFeeds: [rawSubChannel],
      messages: [rawMessage],
      users: [user11],
      files: [],
    },
  };

  const subChannelWithNoMessagePreviewGetResponse = {
    data: {
      messageFeeds: [{ ...rawSubChannel, messagePreviewId: undefined }],
      messages: [],
      users: [user11],
      files: [],
    },
  };

  const rawNewCreatedMessage = generateRawMessage({
    channelId: 'channelId11',
    channelPublicId: 'channelId11',
    messageFeedId: 'messageFeedId1',
    messageId: 'messageId2',
    creatorId: 'test',
    creatorPublicId: 'test',
  });

  const rawNewSubChannelWithMessagePreview = generateRawSubChannel({
    channelId: 'channelId11',
    channelPublicId: 'channelId11',
    messageFeedId: 'messageFeedId1',
    creatorId: 'test',
    creatorPublicId: 'test',
    channelType: 'conversation',
    messagePreviewId: 'messageId2',
  });

  const rawUpdatedSubChannelWithMessagePreview = {
    ...rawNewSubChannelWithMessagePreview,
    name: 'messageFeed1-edit',
  };

  const messagesFromResponse = subChannelWithMessagePreviewGetResponse.data.messages[0];
  const messageFeedsFromResponse = subChannelWithMessagePreviewGetResponse.data.messageFeeds[0];

  const messagePreview = {
    channelId: messagesFromResponse.channelPublicId,
    subChannelId: messagesFromResponse.messageFeedId,
    dataType: messagesFromResponse.dataType,
    isDeleted: messagesFromResponse.isDeleted,
    segment: messagesFromResponse.segment,
    creatorId: messagesFromResponse.creatorPublicId,
    createdAt: messagesFromResponse.createdAt,
    data: messagesFromResponse.data,
    updatedAt: messagesFromResponse.updatedAt!,
    subChannelName: messageFeedsFromResponse.name!,
    subChannelUpdatedAt: messageFeedsFromResponse.updatedAt!,
    messagePreviewId: messageFeedsFromResponse.messagePreviewId!,
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
    createdAt: messagesFromResponse.createdAt,
    data: {
      text: 'updated',
    },
    updatedAt: date,
  };

  const rawDeletedMessage: Amity.RawMessage = {
    ...rawMessage,
    createdAt: messagesFromResponse.createdAt,
    isDeleted: true,
    updatedAt: date,
  };

  const updatedMessagePreview = {
    ...messagePreview,
    data: rawUpdatedMessage.data,
    updatedAt: rawUpdatedMessage.updatedAt,
  };

  const deletedMessagePreview = {
    ...messagePreview,
    isDeleted: true,
    updatedAt: rawDeletedMessage.updatedAt,
  };

  const rawUpdatedSubChannel = {
    ...rawSubChannel,
    name: 'messageFeed1-edit',
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
    subChannelUpdatedAt: rawUpdatedSubChannel.updatedAt,
  };

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
      test('it should return subChannel live object with message preview', async () => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(subChannelWithMessagePreviewGetResponse);

        getSubChannel(
          subChannelWithMessagePreviewGetResponse.data.messageFeeds[0].messageFeedId,
          callback,
        );
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
              data: getSubChannelMessagePreviewWithUser(
                convertSubChannelFromRaw(
                  subChannelWithMessagePreviewGetResponse.data.messageFeeds[0],
                ),
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

      const cases: [string, keyof Amity.Events, ValueOf<Amity.Events>, Amity.SubChannel][] = [
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
            // TODO: fix lastActivity to be rawNewCreatedMessage.createdAt
            // lastActivity: rawNewCreatedMessage.createdAt,
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
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
            ...convertSubChannelFromRaw({
              ...rawUpdatedSubChannelWithMessagePreview,
              updatedAt: rawUpdatedSubChannel.updatedAt,
            }),
            messagePreviewId: updatedSubChannelMessagePreview.messagePreviewId,
            messagePreview: updatedSubChannelMessagePreview,
          },
        ],
      ];

      test.each(cases)('%s', async (test, event, eventPayload, expected) => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(subChannelWithMessagePreviewGetResponse);

        getSubChannel(
          subChannelWithMessagePreviewGetResponse.data.messageFeeds[0].messageFeedId,
          callback,
        );
        await pause();

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

      const cases: [string, keyof Amity.Events, ValueOf<Amity.Events>, Amity.SubChannel][] = [
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
            // TODO: fix lastActivity to be rawNewCreatedMessage.createdAt
            // lastActivity: rawNewCreatedMessage.createdAt,
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
            messagePreviewId: undefined,
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
            ...convertSubChannelFromRaw({
              ...rawUpdatedSubChannelWithMessagePreview,
              updatedAt: rawUpdatedSubChannel.updatedAt,
            }),
            messagePreviewId: updatedSubChannelMessagePreview.messagePreviewId,
            messagePreview: updatedSubChannelMessagePreview,
          },
        ],
      ];

      test.each(cases)('%s', async (test, event, eventPayload, expected) => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(subChannelWithMessagePreviewGetResponse);

        getSubChannel(
          subChannelWithMessagePreviewGetResponse.data.messageFeeds[0].messageFeedId,
          callback,
        );
        await pause();

        if (event === 'message.deleted') {
          client.http.get = jest.fn().mockResolvedValue(subChannelWithNoMessagePreviewGetResponse);

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

      const cases: [string, keyof Amity.Events, ValueOf<Amity.Events>, Amity.SubChannel][] = [
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
            // TODO: fix lastActivity to be rawNewCreatedMessage.createdAt
            // lastActivity: rawNewCreatedMessage.createdAt,
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
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
            ...convertSubChannelFromRaw(rawNewSubChannelWithMessagePreview),
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
            ...convertSubChannelFromRaw({
              ...rawUpdatedSubChannelWithMessagePreview,
              updatedAt: rawUpdatedSubChannel.updatedAt,
            }),
            messagePreviewId: updatedSubChannelMessagePreview.messagePreviewId,
            messagePreview: updatedSubChannelMessagePreview,
          },
        ],
      ];

      test.each(cases)('%s', async (test, event, eventPayload, expected) => {
        const callback = jest.fn();
        client.http.get = jest.fn().mockResolvedValue(subChannelWithNoMessagePreviewGetResponse);

        getSubChannel(
          subChannelWithNoMessagePreviewGetResponse.data.messageFeeds[0].messageFeedId,
          callback,
        );
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
              data: getSubChannelMessagePreviewWithUser(
                convertSubChannelFromRaw(
                  subChannelWithNoMessagePreviewGetResponse.data.messageFeeds[0],
                ),
              ),
              loading: false,
            }),
          ),
        );
      });
    });
  });
});
