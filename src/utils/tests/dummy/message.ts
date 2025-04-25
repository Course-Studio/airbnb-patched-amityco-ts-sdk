import { convertFromRaw as convertSubChannelFromRaw } from '~/subChannelRepository/utils/convertSubChannelFromRaw';
import { channel1, user11, file11 } from '.';

export function generateRawMessage(params?: Partial<Amity.RawMessage>): Amity.RawMessage {
  return {
    channelId: 'channel-id',
    channelPublicId: 'channel-public-id',
    channelType: 'community',
    childCount: 0,
    createdAt: new Date().toISOString(),
    creatorId: 'user-id',
    creatorPublicId: 'user-public-id',
    data: { text: 'message text', caption: '' },
    dataType: 'text',
    editedAt: new Date().toISOString(),
    flagCount: 0,
    hashFlag: null,
    isDeleted: false,
    mentionedUsers: [],
    messageFeedId: 'message-feed-id',
    messageId: 'message-id',
    path: 'message-path',
    reactionCount: 0,
    segment: 1,
    tags: [],
    updatedAt: new Date().toISOString(),
    ...params,
  };
}

export const convertRawMessage = ({
  channelPublicId,
  childCount,
  creatorPublicId,
  mentionedUsers,
  messageFeedId,
  reactionCount,
  reactions,
  referenceId,
  segment,
  messageId,
  myReactions,
  creatorId,
  ...rest
}: Amity.RawMessage): Amity.InternalMessage => ({
  ...rest,
  messageId,
  channelId: channelPublicId,
  channelSegment: segment,
  childrenNumber: childCount,
  creatorId: creatorPublicId,
  mentionees: mentionedUsers?.map(mention => {
    if (mention.type === 'channel') return mention;

    return { type: 'user', userIds: mention.userPublicIds };
  }),
  reactions: reactions ?? {},
  reactionsCount: reactionCount,
  subChannelId: messageFeedId,
  uniqueId: messageId,
  myReactions: [],
  creatorPrivateId: creatorId,
});

export const withLinkedObject = (message: Amity.InternalMessage): Amity.Message => ({
  ...message,
  readCount: 0,
  deliveredCount: 0,
  markRead: () => {
    console.log('markRead');
  },
});

export const convertRawMessagePayload = (
  rawPayload: Amity.MessagePayload,
): Amity.ProcessedMessagePayload => ({
  ...rawPayload,
  messages: rawPayload.messages.map(convertRawMessage),
});

export const message11: Amity.InternalMessage = convertRawMessage(
  generateRawMessage({
    channelPublicId: channel1.channelId,
    creatorPublicId: user11.userId,
    messageId: 'message11',
  }),
);

export const messages = {
  subChannelId: message11.subChannelId,
  page1: [message11.messageId, 'messageId12', 'messageId13'],
  page2: ['messageId21', 'messageId22', 'messageId23'],
  page3: ['messageId31', 'messageId32', 'messageId33'],
  page4: ['messageId41', 'messageId42', 'messageId43'],
};

export const messagesDesc = {
  subChannelId: message11.subChannelId,
  page1: ['messageId103', 'messageId102', 'messageId101'],
  page2: ['messageId93', 'messageId92', 'messageId91'],
  page3: ['messageId83', 'messageId82', 'messageId81'],
};

export const messageQueryResponse = {
  data: {
    messages: [message11],
    files: [],
    users: [],
    paging: {
      previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
      next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
    },
  },
};

// for testing ingest in cache
export const messagePayload = {
  messages: [message11],
  files: [file11],
  users: [user11],
};
