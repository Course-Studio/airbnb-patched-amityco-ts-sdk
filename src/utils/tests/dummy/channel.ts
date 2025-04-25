import { withUsers } from '~/group/utils';
import { convertFromRaw } from '~/channelRepository/utils';
import { activeUser } from '~/utils/tests';
import * as activeUserModule from '~/client/api/activeUser';

import { date, user11, user12, user13, user14, file11 } from '.';
import {
  generateRawMessageFeedsInfo,
  generateRawMessagePreviewChannel,
} from './messagePreviewChannel';

export const convertChannelFromRaw = (channel: Amity.RawChannel): Amity.InternalChannel => {
  jest.spyOn(activeUserModule, 'getActiveUser').mockReturnValue(activeUser);
  return convertFromRaw(channel);
};

export const convertRawChannelPayload = (
  rawPayload: Amity.ChannelPayload,
): Amity.ProcessedChannelPayload => ({
  ...rawPayload,
  channels: rawPayload.channels.map(channel => convertChannelFromRaw(channel)),
  channelUsers: withUsers(rawPayload.channelUsers),
});

export function generateRawChannel(params?: Partial<Amity.RawChannel>): Amity.RawChannel {
  const channelId = params?.channelId ?? 'channelId11';

  return {
    _id: `${channelId}-internalId`,
    lastActivity: '',
    channelId,
    createdAt: date,
    isDeleted: false,
    messageCount: 0,
    path: `${channelId}-path`,
    tags: [],
    type: 'community',
    updatedAt: date,
    messagePreviewId: undefined,
    ...params,
  };
}

export function generateRawChannelUser(
  params?: Partial<Amity.RawMembership<'channel'>>,
): Amity.RawMembership<'channel'> {
  return {
    channelId: 'channelId11',
    createdAt: date,
    isBanned: false,
    isMuted: false,
    lastActivity: date,
    lastMentionedSegment: 0,
    membership: 'member',
    muteTimeout: '',
    permissions: [],
    readToSegment: 0,
    roles: [],
    userId: user11.userId,
    ...params,
  };
}

export const convertChannelUserFromRaw = (
  member: Amity.RawMembership<'channel'>,
  user: Amity.InternalUser | undefined,
): Amity.Membership<'channel'> => ({
  ...member,
  user,
});

export const mockPage = {
  paging: {
    previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
    next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
  },
};

export const channelRaw1: Amity.RawChannel = generateRawChannel({ type: 'conversation' });

export const channelRawLive1: Amity.RawChannel = generateRawChannel({ type: 'live' });

export const channelRawConversation1: Amity.RawChannel = generateRawChannel({
  type: 'conversation',
});

export const channelRawWithNoMessgePreviewConversation1: Amity.RawChannel = generateRawChannel({
  type: 'conversation',
  messagePreviewId: undefined,
  lastActivity: date,
});

export const channelRawWithMessgePreviewConversation1: Amity.RawChannel = generateRawChannel({
  type: 'conversation',
  messagePreviewId: 'messageId1',
  lastActivity: date,
});

export const channelRaw2: Amity.RawChannel = generateRawChannel({
  channelId: 'channelId12',
  tags: ['tag1'],
  type: 'conversation',
});

export const channelRaw3: Amity.RawChannel = generateRawChannel({
  channelId: 'channelId21',
});

// internal channel object
export const channelModel1: Amity.InternalChannel = {
  ...channelRaw1,
  defaultSubChannelId: channelRaw1._id,
  isUnreadCountSupport: true,
  unreadCount: 0,
  hasMentioned: false,
  isMentioned: false,
  messagePreviewId: undefined,
  subChannelsUnreadCount: 0,
};

export const channelModel2: Amity.InternalChannel = {
  ...channelRaw2,
  defaultSubChannelId: channelRaw2._id,
  isUnreadCountSupport: true,
  unreadCount: 0,
  hasMentioned: false,
  isMentioned: false,
  messagePreviewId: undefined,
  subChannelsUnreadCount: 0,
};

export const channel1: Amity.Channel = {
  ...channelRaw1,
  defaultSubChannelId: channelRaw1._id,
  isUnreadCountSupport: true,
  unreadCount: 0,
  hasMentioned: false,
  isMentioned: false,
  messagePreviewId: undefined,
  messagePreview: null,
  subChannelsUnreadCount: 0,
};

export const channel2: Amity.Channel = {
  ...channelRaw2,
  defaultSubChannelId: channelRaw2._id,
  isUnreadCountSupport: true,
  unreadCount: 0,
  hasMentioned: false,
  isMentioned: false,
  messagePreviewId: undefined,
  messagePreview: null,
  subChannelsUnreadCount: 0,
};

export const rawChannelUser = generateRawChannelUser();
export const channelUser = convertChannelUserFromRaw(rawChannelUser, user11);

export const rawChannelUser2 = generateRawChannelUser({
  channelId: channel2.channelId,
  lastMentionedSegment: 2,
  readToSegment: 1,
});
export const channelUser2 = convertChannelUserFromRaw(rawChannelUser2, user11);

export const rawChannelUser3 = generateRawChannelUser({
  membership: 'none',
  roles: ['test-role'],
  userId: user12.userId,
});
export const channelUser3 = convertChannelUserFromRaw(rawChannelUser3, user12);

export const channelUser4 = generateRawChannelUser({
  membership: 'none',
  roles: ['test-role'],
  userId: user13.userId,
});

export const rawBannedChannelUser = generateRawChannelUser({
  isBanned: true,
  membership: 'banned',
  userId: user13.userId,
});
export const bannedChannelUser = convertChannelUserFromRaw(rawBannedChannelUser, user13);

export const rawMutedChannelUser = generateRawChannelUser({
  isMuted: true,
  userId: 'test',
});
export const mutedChannelUser = convertChannelUserFromRaw(rawMutedChannelUser, user11);

export const rawChannelUserWithRole = generateRawChannelUser({
  roles: ['test-role'],
  userId: user14.userId,
});
export const channelUserWithRole = convertChannelUserFromRaw(rawChannelUserWithRole, user14);

export const channelQueryResponse = {
  data: {
    channels: [channelRaw1, channelRaw2],
    channelUsers: [],
    files: [],
    users: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const channelQueryResponseWithoutPaging = {
  data: {
    channels: [channelRaw1, channelRaw2],
    channelUsers: [],
    files: [],
    users: [],
    messagePreviews: [],
  },
};

export const channelGetResponseWithMessagePreview = {
  data: {
    channels: [channelRawWithMessgePreviewConversation1],
    channelUsers: [],
    files: [],
    users: [user11, user12],
    messagePreviews: [
      generateRawMessagePreviewChannel({
        channelId: channelRaw1.channelId,
        channelPublicId: channelRaw1.channelId,
        messageFeedId: channelRaw1.channelId,
        creatorId: user11.userId,
        creatorPublicId: user11.userId,
        messageId: 'messageId1',
      }),
    ],
    messageFeedsInfo: [
      generateRawMessageFeedsInfo({
        messageFeedId: channelRaw1.channelId,
        name: 'subChannel1',
        messagePreviewId: 'messageId1',
      }),
    ],
  },
};

export const channelGetResponseWithNoMessagePreview = {
  data: {
    channels: [channelRawWithNoMessgePreviewConversation1],
    channelUsers: [],
    files: [],
    users: [user11, user12],
    messagePreviews: [],
    messageFeedsInfo: [],
  },
};

export const channelQueryResponseWithMessagePreview = {
  data: {
    channels: [channelRawWithMessgePreviewConversation1, channelRaw2],
    channelUsers: [],
    files: [],
    users: [user11, user12],
    messagePreviews: [
      generateRawMessagePreviewChannel({
        channelId: channelRaw1.channelId,
        channelPublicId: channelRaw1.channelId,
        messageFeedId: channelRaw1.channelId,
        creatorId: user11.userId,
        creatorPublicId: user11.userId,
        messageId: 'messageId1',
      }),
    ],
    messageFeedsInfo: [
      generateRawMessageFeedsInfo({
        messageFeedId: channelRaw1.channelId,
        name: 'subChannel1',
        messagePreviewId: 'messageId1',
      }),
    ],
    ...mockPage,
  },
};

export const channelQueryResponseWithNoMessagePreview = {
  data: {
    channels: [channelRawWithNoMessgePreviewConversation1, channelRaw2],
    channelUsers: [],
    files: [],
    users: [user11, user12],
    messagePreviews: [],
    messageFeedsInfo: [],
    ...mockPage,
  },
};

export const getChannelsResponse = {
  data: {
    channels: [channelRaw1, channelRaw2, channelRaw3],
    channelUsers: [],
    files: [],
    users: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const channelQueryResponsePage2 = {
  data: {
    channels: [channelRaw3],
    channelUsers: [],
    files: [],
    users: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const channelTagQueryResponse = {
  data: {
    channels: [channelRaw2],
    channelUsers: [],
    files: [],
    users: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const channelExcludeTagQueryResponse = {
  data: {
    channels: [channelRaw1, channelRaw3],
    channelUsers: [],
    files: [],
    users: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const channelUserQueryResponse = {
  data: {
    channels: [channelRaw1],
    channelUsers: [rawChannelUser, rawChannelUser3],
    users: [user11, user12],
    files: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const emptyChannelUserQueryResponse = {
  data: {
    channels: [channelRaw1],
    channelUsers: [],
    users: [],
    files: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const channelUserModel = [channelUser, { ...rawChannelUser3, user: user12 }];

export const channelUserQueryResponsePage2 = {
  data: {
    channels: [channelRaw1],
    channelUsers: [channelUser4],
    users: [user13],
    files: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const channelUserQueryResponsePage3 = {
  data: {
    channels: [channelRaw1],
    channelUsers: [rawChannelUserWithRole, rawMutedChannelUser, rawBannedChannelUser],
    users: [user14, user11, user13],
    files: [],
    messagePreviews: [],
    ...mockPage,
  },
};

export const rawChannelPayload: Amity.ChannelPayload = {
  channels: [channelRaw1],
  channelUsers: [rawChannelUserWithRole, rawMutedChannelUser],
  users: [user14, user11],
  files: [file11],
  messagePreviews: [],
};

// for testing ingest in cache
export const channelPayload: Amity.ProcessedChannelPayload = {
  channels: [channel1],
  channelUsers: [channelUserWithRole, mutedChannelUser],
  users: [user14, user11],
  files: [file11],
};

export const liveChannelPayload = {
  channels: [channelRawLive1],
  channelUsers: [rawChannelUserWithRole, rawMutedChannelUser],
  users: [user14, user11],
  files: [file11],
  messagePreviews: [],
};

export const conversationChannelPayload = {
  channels: [channelRawConversation1],
  channelUsers: [rawChannelUserWithRole, rawMutedChannelUser],
  users: [user14, user11],
  files: [file11],
  messagePreviews: [],
};

export const channelDisplayName1 = generateRawChannel({
  channelId: 'channelId1',
  displayName: 'channel1',
  type: 'community',
});

export const channelDisplayName2 = generateRawChannel({
  channelId: 'channelId2',
  displayName: 'channel2',
  type: 'live',
});

export const channelDisplayName3 = generateRawChannel({
  channelId: 'channelId3',
  displayName: 'channel3',
  type: 'live',
});

export const channelDisplayName4 = generateRawChannel({
  channelId: 'channelId4',
  displayName: 'channel4',
  type: 'broadcast',
});

export const channelCreatedAt1 = generateRawChannel({
  channelId: 'channelId-CreateAt1',
  createdAt: '2023-09-29T12:00:00.000Z',
  displayName: '',
});

export const channelCreatedAt2 = generateRawChannel({
  channelId: 'channelId-CreateAt2',
  createdAt: '2023-09-29T12:00:01.000Z',
  displayName: '',
});

export const channelCreatedAt3 = generateRawChannel({
  channelId: 'channelId-CreateAt3',
  createdAt: '2023-09-29T12:00:02.000Z',
  displayName: '',
});

export const channelLastActivity1 = generateRawChannel({
  channelId: 'channelId1',
  lastActivity: '2023-09-29T12:00:00.000Z',
});

export const channelLastActivity2 = generateRawChannel({
  channelId: 'channelId2',
  lastActivity: '2023-09-29T12:00:01.000Z',
});

export const channelLastActivity3 = generateRawChannel({
  channelId: 'channelId3',
  lastActivity: '2023-09-29T12:00:02.000Z',
});
