export {};

declare global {
  namespace Amity {
    type InternalMessagePreview<T extends Amity.MessageContentType = any> = {
      messagePreviewId: string;
      subChannelName: string;
      data?: Amity.ContentData<T>;
      dataType?: T;
      channelId: Amity.Channel['channelId'];
      subChannelId: Amity.SubChannel['subChannelId'];
      isDeleted?: boolean;
      segment: number;
      subChannelUpdatedAt: Amity.timestamp;
      creatorId: Amity.InternalUser['userId'];
    } & Amity.Timestamps;

    type MessagePreview = Omit<InternalMessagePreview, 'creatorId'> & { user?: Amity.User };

    const enum MessagePreviewSetting {
      NO_MESSAGE_PREVIEW = 'no-message-preview',
      MESSAGE_PREVIEW_NOT_INCLUDE_DELETED = 'message-preview-not-include-deleted',
      MESSAGE_PREVIEW_INCLUDE_DELETED = 'message-preview-include-deleted',
    }
  }
}
