import * as activeUserModule from '~/client/api/activeUser';
import { convertFromRaw } from '~/subChannelRepository/utils/convertSubChannelFromRaw';
import { activeUser } from '~/utils/tests';

import { channelRaw1, date, user11 } from '.';

export function generateRawSubChannel(params?: Partial<Amity.RawSubChannel>): Amity.RawSubChannel {
  return {
    channelId: 'private-channel-id',
    channelPublicId: channelRaw1.channelId,
    channelType: channelRaw1.type,
    childCount: 0,
    createdAt: date,
    creatorId: 'private-user-id',
    creatorPublicId: user11.userId,
    isDeleted: false,
    lastMessageId: 'xxx',
    lastMessageTimestamp: date,
    messageFeedId: `${channelRaw1.channelId}--sub-channel-id`,
    name: 'sub channel name',
    path: 'sub-channel-path',
    updatedAt: date,
    ...params,
  };
}

export const convertSubChannelFromRaw = (subChannel: Amity.RawSubChannel): Amity.SubChannel => {
  jest.spyOn(activeUserModule, 'getActiveUser').mockReturnValue(activeUser);
  return convertFromRaw(subChannel);
};

export function generateSubChannel(params?: Record<string, any>): Amity.SubChannel {
  return {
    ...convertSubChannelFromRaw(generateRawSubChannel()),
    ...params,
  };
}

export function generateRawMessagePreviewSubChannel(
  params: Partial<Amity.SubChannelMessagePreviewPayload>,
) {
  return {
    messageId: 'messageId1',
    parentId: 'parentId1',
    channelId: 'channelId1',
    channelPublicId: 'channelPublicId1',
    messageFeedId: 'messageFeedId1',
    data: {
      text: 'text1',
    },
    dataType: 'text',
    creatorId: 'creatorId1',
    isDeleted: false,
    segment: 1,
    creatorPublicId: 'creatorPublicId1',
    updatedAt: date,
    createdAt: date,
    path: '',
    flagCount: 0,
    hashFlagged: null,
    childCount: 0,
    channelType: 'conversation',
    reactionCount: 0,
    ...params,
  };
}
