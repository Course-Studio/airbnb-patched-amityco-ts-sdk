import { ingestInCache } from '~/cache/api/ingestInCache';

export const updateSubChannelMessagePreviewCache = (rawPayload: Amity.SubChannelPayload) => {
  const withMessageFeedInfo = (messagePreview: Amity.SubChannelMessagePreviewPayload) => {
    const messageFeedInfo = rawPayload.messageFeeds?.find(messageFeed => {
      return messageFeed.messageFeedId === messagePreview.messageFeedId;
    });

    const {
      channelPublicId: channelId,
      messageFeedId: subChannelId,
      messageId: messagePreviewId,
      creatorPublicId: creatorId,
      data,
      dataType,
      isDeleted,
      segment,
      createdAt,
      updatedAt,
    } = messagePreview;

    return {
      messagePreviewId,
      channelId,
      subChannelId,
      data,
      dataType,
      isDeleted,
      segment,
      creatorId,
      createdAt,
      updatedAt,
      subChannelName: messageFeedInfo?.name!,
      subChannelUpdatedAt: messageFeedInfo?.updatedAt!,
    };
  };
  const newData = {
    messagePreviewSubChannel:
      rawPayload.messages?.map(messagePreview => withMessageFeedInfo(messagePreview)) ?? [],
  };

  ingestInCache(newData);
};
