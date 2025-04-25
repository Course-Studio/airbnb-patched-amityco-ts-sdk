import { ingestInCache } from '~/cache/api/ingestInCache';

export const updateChannelMessagePreviewCache = (rawPayload: Amity.ChannelPayload) => {
  const withMessageFeedInfo = (messagePreview: Amity.MessagePreviewPayload) => {
    const messageFeedInfo = rawPayload.messageFeedsInfo?.find(messageFeed => {
      return messageFeed.messageFeedId === messagePreview.messageFeedId;
    });

    const {
      channelPublicId: channelId,
      messageFeedId: subChannelId,
      data,
      dataType,
      isDeleted,
      segment,
      creatorPublicId: creatorId,
      createdAt,
      updatedAt,
    } = messagePreview;

    return {
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
      messagePreviewId: messageFeedInfo?.messagePreviewId!,
      subChannelUpdatedAt: messageFeedInfo?.updatedAt!,
    };
  };

  const newData = {
    messagePreviewChannel:
      rawPayload.messagePreviews?.map(messagePreview => withMessageFeedInfo(messagePreview)) ?? [],
  };

  ingestInCache(newData);
};
