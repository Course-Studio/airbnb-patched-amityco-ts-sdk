export const MessageContentType = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  VIDEO: 'video',
  AUDIO: 'audio',
  CUSTOM: 'custom',
});

declare global {
  namespace Amity {
    type MessageContentType = ValueOf<typeof MessageContentType>;

    type MessageActionType =
      | 'onCreate'
      | 'onUpdate'
      | 'onDelete'
      | 'onFetch'
      | 'onFlagged'
      | 'onUnflagged'
      | 'onFlagCleared'
      | 'onReactionAdded'
      | 'onReactionRemoved';

    type MessageOptimistic = {
      syncState?: Amity.SyncState;
    };

    type RawMessage<T extends Amity.MessageContentType = any> = {
      channelId: string;
      channelPublicId: string;
      channelType: Amity.Channel['type'];
      childCount: number;
      creatorId: string;
      creatorPublicId: string;
      // TODO: check if editedAt appears on edit
      editedAt?: Amity.timestamp;
      mentionedUsers?: Array<
        Amity.ChannelMention | (Amity.UserMention & { userPublicIds: string[] })
      >;
      messageFeedId: Amity.RawSubChannel['messageFeedId'];
      messageId: string;
      myReactions?: string[];
      parentId?: string;
      reactionCount: number;
      reactions?: Record<string, number>;
      referenceId?: string; // https://ekoapp.atlassian.net/wiki/spaces/UP/pages/2085716114/SDK+V5+message+migration#Handling-%E2%80%98ReferenceId%E2%80%99-in-message-creation
      segment: number;
    } & Amity.Content<T> &
      Amity.Flaggable &
      Amity.Metadata &
      // Amity.Reactable &
      Amity.SoftDelete &
      Amity.Subscribable &
      Amity.Taggable &
      Amity.Timestamps;

    type Message<T extends Amity.MessageContentType = any> = {
      channelId: Amity.Channel['channelId'];
      channelSegment: number;
      childrenNumber: number;
      creatorId: string;
      creator?: Amity.User;
      editedAt?: Amity.timestamp;
      parentId?: string;
      messageId: string;
      subChannelId: Amity.SubChannel['subChannelId'];
      channelType: Amity.Channel['type'];
      uniqueId: string;
      readCount: number;
      deliveredCount: number;
      referenceId?: string;
      markRead: () => void;
    } & Amity.Content<T> &
      Amity.Flaggable &
      Amity.Mentionable<'user' | 'channel'> &
      Amity.Metadata &
      Amity.Reactable &
      Amity.SoftDelete &
      Amity.Subscribable &
      Amity.Timestamps &
      Amity.Taggable &
      Amity.MessageOptimistic;

    type InternalMessage<T extends Amity.MessageContentType = any> = Omit<
      Amity.Message<T>,
      'readCount' | 'deliveredCount' | 'markRead'
    > & { creatorPrivateId: string };

    type QueryMessages = {
      subChannelId: Amity.SubChannel['subChannelId'];
      type?: Amity.MessageContentType;
      excludingTags?: Amity.Taggable['tags'];
      hasFlags?: boolean;
      includeDeleted?: boolean;
      /*
       * For messages the after and before values are messageId
       */
      page?: Amity.Page<string>;
      parentId?: Amity.Message['parentId'];
      sortBy?: 'segmentAsc' | 'segmentDesc';
      includingTags?: Amity.Taggable['tags'];
      pageToken?: string;
      aroundMessageId?: Amity.Message['messageId'];
    };

    type QueryReadUsers = {
      messageId: Amity.Message['messageId'];
      memberships?: ('member' | 'banned' | 'muted' | 'non-member' | 'deleted')[];
      page?: Amity.Page;
    };

    type QueryDeliveredUsers = {
      messageId: Amity.Message['messageId'];
      memberships?: ('member' | 'banned' | 'muted' | 'non-member' | 'deleted')[];
      page?: Amity.Page;
    };

    type MessagesLiveCollection = Amity.LiveCollectionParams<Omit<QueryMessages, 'page'>>;

    type MessageLiveCollectionCache = Amity.LiveCollectionCache<
      Amity.Message['subChannelId'],
      Pick<QueryMessages, 'page'> & { paging?: Amity.Pagination['paging'] }
    >;
  }
}
