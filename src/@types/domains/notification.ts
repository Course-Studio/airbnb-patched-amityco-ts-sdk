export {};

declare global {
  namespace Amity {
    const enum TrayItemCategoryType {
      POST_MENTION = 'mention_in_post',
      COMMENT_MENTION = 'mention_in_comment',
      REPLY_MENTION = 'mention_in_reply',
      POLL_MENTION = 'mention_in_poll',
      POST_REACT = 'reaction_on_post',
      COMMENT_REACT = 'reaction_on_comment',
      REPLY_REACT = 'reaction_on_reply',
    }

    const enum TrayAction {
      POST = 'post',
      POLL = 'poll',
      COMMENT = 'comment',
      REACTION = 'reaction',
      MENTION = 'mention',
      REPLY = 'reply',
    }

    type RawNotificationTrayItem = {
      _id: string;
      lastSeenAt: Amity.timestamp;
      lastOccurredAt: Amity.timestamp;
      actors: {
        _id: string;
        publicId: string;
        lastActedAt: Amity.timestamp;
      }[];
      actorsCount: number;
      trayItemCategory?: TrayItemCategoryType;
      targetId: string;
      targetType: string;
      referenceId?: string;
      referenceType?: string;
      actionType: TrayAction;
      actionReferenceId?: string;
      parentId?: string;
      text: string;
      templatedText: string;
      daySegment: Amity.timestamp;
    };

    type InternalNotificationTrayItem = RawNotificationTrayItem;

    type QueryNotificationTrayItem = {
      token?: Amity.Token;
      limit?: Amity.PageLimit['limit'];
    };

    type NotificationTrayItemLiveCollection = Amity.LiveCollectionParams<
      Omit<QueryNotificationTrayItem, 'limit'>
    >;

    type NotificationTrayItemLiveCollectionCache = Amity.LiveCollectionCache<
      Amity.InternalNotificationTrayItem['_id'],
      Pick<QueryNotificationTrayItem, 'limit'>
    >;

    type NotificationTrayItem = Amity.InternalNotificationTrayItem & {
      isSeen: boolean;
      isRecent: boolean;
      users: Amity.User[];
    };

    type RawNotificationTraySeen = {
      lastTraySeenAt: Amity.timestamp;
      lastTrayOccurredAt: Amity.timestamp;
    };

    type RawNotificationTraySeenUpdated = {
      lastTraySeenAt: Amity.timestamp;
    };

    type InternalNotificationTraySeen = RawNotificationTraySeen & {
      userId: string;
      isSeen: boolean;
    };

    type NotificationTraySeen = RawNotificationTraySeen & { isSeen: boolean };

    type RawNotificationItemSeen = {
      lastSeenAt: Amity.timestamp;
    };

    type QueryNotificationItemSeen = {
      id: string;
      lastSeenAt: Amity.timestamp;
    };
  }
}
