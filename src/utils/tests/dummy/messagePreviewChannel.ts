import { date } from '.';

export const generateRawMessagePreviewChannel = (
  params?: Partial<Amity.MessagePreviewPayload>,
): Amity.MessagePreviewPayload => {
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
    createdAt: date,
    updatedAt: date,
    ...params,
  };
};

export const generateRawMessageFeedsInfo = (
  params?: Partial<Amity.messageFeedsInfoPayload>,
): Amity.messageFeedsInfoPayload => {
  return {
    messagePreviewId: 'messageId1',
    messageFeedId: 'subChannelId1',
    name: 'subChannel1',
    createdAt: date,
    updatedAt: date,
    ...params,
  };
};
