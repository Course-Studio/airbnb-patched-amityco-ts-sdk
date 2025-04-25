export {};
declare global {
    namespace Amity {
        /**
         * type map of "domain name -> ASC model"
         * @hidden
         */
        type Models = {
            user: Amity.InternalUser;
            file: Amity.File;
            role: Amity.Role;
            story: Amity.InternalStory;
            storyTarget: Amity.RawStoryTarget;
            channel: Amity.StaticInternalChannel;
            subChannel: Amity.SubChannel;
            channelUsers: Amity.Membership<'channel'>;
            message: Amity.InternalMessage;
            messagePreviewChannel: Amity.InternalMessagePreview;
            messagePreviewSubChannel: Amity.InternalMessagePreview;
            channelUnreadInfo: Amity.ChannelUnreadInfo;
            subChannelUnreadInfo: Amity.SubChannelUnreadInfo;
            channelUnread: Amity.ChannelUnread;
            channelMarker: Amity.ChannelMarker;
            subChannelMarker: Amity.SubChannelMarker;
            messageMarker: Amity.MessageMarker;
            feedMarker: Amity.FeedMarker;
            userMarker: Amity.UserMarker;
            community: Amity.Community;
            category: Amity.InternalCategory;
            communityUsers: Amity.Membership<'community'>;
            post: Amity.InternalPost;
            comment: Amity.InternalComment;
            commentChildren: Amity.InternalComment;
            poll: Amity.Poll;
            reaction: Amity.Reaction;
            reactor: Amity.InternalReactor;
            stream: Amity.InternalStream;
            streamModeration: Amity.StreamModeration;
            follow: Amity.FollowStatus;
            followInfo: Amity.FollowInfo;
            followCount: Amity.FollowCount;
            feed: Amity.Feed;
            ad: Amity.InternalAd;
            advertiser: Amity.InternalAdvertiser;
            pinTarget: Amity.InternalPinTarget;
            pin: Amity.InternalPin;
            notificationTrayItem: Amity.InternalNotificationTrayItem;
            notificationTraySeen: Amity.InternalNotificationTraySeen;
        };
        type Model = ValueOf<Models>;
        type Domain = keyof Models;
        /**
         * Definition of the minimal set of properties necessary to identify
         * successfully a model.
         * @hidden
         */
        type Minimal = {
            user: Pick<Amity.InternalUser, 'userId'>;
            file: Pick<Amity.File, 'fileId'>;
            role: Pick<Amity.Role, 'roleId'>;
            story: Pick<Amity.InternalStory, 'referenceId'>;
            storyTarget: Pick<Amity.RawStoryTarget, 'targetId'>;
            channel: Pick<Amity.Channel, 'channelInternalId'>;
            subChannel: Pick<Amity.SubChannel, 'subChannelId'>;
            channelUsers: Pick<Amity.Membership<'channel'>, 'channelId' | 'userId'>;
            message: Pick<Amity.InternalMessage, 'messageId' | 'referenceId'>;
            messagePreviewChannel: Pick<Amity.MessagePreview, 'channelId'>;
            messagePreviewSubChannel: Pick<Amity.MessagePreview, 'subChannelId'>;
            channelUnreadInfo: Pick<Amity.ChannelUnreadInfo, 'channelId'>;
            subChannelUnreadInfo: Pick<Amity.SubChannelUnreadInfo, 'subChannelId'>;
            channelUnread: Pick<Amity.ChannelUnread, 'channelId'>;
            channelMarker: Pick<Amity.ChannelMarker, 'entityId' | 'userId'>;
            subChannelMarker: Pick<Amity.SubChannelMarker, 'feedId' | 'entityId' | 'userId'>;
            messageMarker: Pick<Amity.MessageMarker, 'feedId' | 'contentId' | 'creatorId'>;
            feedMarker: Pick<Amity.FeedMarker, 'feedId' | 'entityId'>;
            userMarker: Pick<Amity.UserMarker, 'userId'>;
            community: Pick<Amity.Community, 'communityId'>;
            category: Pick<Amity.InternalCategory, 'categoryId'>;
            communityUsers: Pick<Amity.Membership<'community'>, 'communityId' | 'userId'>;
            post: Pick<Amity.InternalPost, 'postId'>;
            comment: Pick<Amity.InternalComment, 'commentId'>;
            commentChildren: Pick<Amity.InternalComment, 'commentId'>;
            poll: Pick<Amity.Poll, 'pollId'>;
            reaction: Pick<Amity.Reaction, 'referenceType' | 'referenceId'>;
            reactor: Pick<Amity.InternalReactor, 'reactionId'>;
            stream: Pick<Amity.InternalStream, 'streamId'>;
            streamModeration: Pick<Amity.StreamModeration, 'streamId'>;
            follow: Pick<Amity.FollowStatus, 'from' | 'to'>;
            followInfo: Pick<Amity.FollowInfo, 'userId' | 'status'>;
            followCount: Pick<Amity.FollowInfo, 'userId' | 'followerCount'>;
            feed: Pick<Amity.Feed, 'targetId' | 'feedId'>;
            ad: Pick<Amity.InternalAd, 'adId'>;
            advertiser: Pick<Amity.Advertiser, 'advertiserId'>;
            pinTarget: Pick<Amity.InternalPinTarget, 'targetId'>;
            pin: Pick<Amity.InternalPin, 'placement' | 'referenceId'>;
            notificationTrayItem: Pick<Amity.InternalNotificationTrayItem, '_id'>;
            notificationTraySeen: Pick<Amity.InternalNotificationTraySeen, 'userId'>;
        };
    }
}
//# sourceMappingURL=model.d.ts.map