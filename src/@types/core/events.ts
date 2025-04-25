/* eslint-disable camelcase */
import { IConnectPacket, IDisconnectPacket, IPublishPacket } from 'mqtt/dist/mqtt';

export {};

declare global {
  namespace Amity {
    type Listener<T = any> = (params: T) => any;

    type ObjectListener<T, K extends string[]> =
      | Listener<T>
      | ({
          onEvent?: (event: K[number], params: T) => void;
        } & {
          [P in K[number]]?: Listener<T>;
        });

    type Unsubscriber = () => void;

    type Subscriber<T = any> = (fn: Amity.Listener<T>) => Unsubscriber;

    type WsEvents = {
      disconnected: Amity.ErrorResponse | undefined;
      error: Amity.ErrorResponse | undefined;
      connect_error: Amity.ErrorResponse | undefined;
      reconnect_error: Amity.ErrorResponse | undefined;
      reconnect_failed: Amity.ErrorResponse | undefined;
    };

    type MqttEvents = {
      connect: IConnectPacket;
      message: [topic: string, payload: Buffer, packet: IPublishPacket];
      disconnect: IDisconnectPacket;
      error: Error;
      close: Error;
      end: undefined;
      reconnect: undefined;

      'video-streaming.didStart': Amity.StreamPayload;
      'video-streaming.didRecord': Amity.StreamPayload;
      'video-streaming.didStop': Amity.StreamPayload;
      'video-streaming.didFlag': Amity.StreamPayload;
      'video-streaming.didTerminate': Amity.StreamPayload;

      'user.didGlobalBan': Amity.UserPayload;
    };

    type MqttChannelUserEvents = {
      'channel.joined': Amity.ChannelMembershipPayload;
      'channel.left': Amity.ChannelMembershipPayload;
      'channel.membersAdded': Amity.ChannelMembershipPayload;
      'channel.membersRemoved': Amity.ChannelMembershipPayload;
      'channel.banned': Amity.ChannelMembershipPayload;
      'channel.unbanned': Amity.ChannelMembershipPayload;
    };

    type MqttChannelEvents = {
      'channel.created': Amity.ChannelPayload;
      'channel.updated': Amity.ChannelPayload;
      'channel.deleted': Amity.ChannelPayload;
      'channel.setMuted': Amity.ChannelPayload;
    } & MqttChannelUserEvents;

    type MqttSubChannelEvents = {
      'message-feed.created': Amity.SubChannelPayload;
      'message-feed.updated': Amity.SubChannelPayload;
      'message-feed.deleted': Amity.SubChannelPayload;
    };

    type MqttMessageEvents = {
      'message.created': Amity.MessagePayload;
      'message.updated': Amity.MessagePayload;
      'message.deleted': Amity.MessagePayload;
      'message.flagged': Amity.MessagePayload;
      'message.unflagged': Amity.MessagePayload;
      'message.flagCleared': Amity.MessagePayload;
      'message.reactionAdded': Amity.MessagePayload;
      'message.reactionRemoved': Amity.MessagePayload;
    };

    type MqttStoryEvents = {
      'story.created': Amity.StoryPayload;
      'story.updated': Amity.StoryPayload;
      'story.deleted': Amity.StoryPayload;
      'story.flagged': Amity.StoryPayload;
      'story.unflagged': Amity.StoryPayload;
      'story.reactionAdded': Amity.StoryReactionPayload;
      'story.reactionRemoved': Amity.StoryReactionPayload;
    };

    type MqttCommunityUserEvents = {
      'community.joined': Amity.CommunityMembershipPayload;
      'community.left': Amity.CommunityMembershipPayload;
      'community.userAdded': Amity.CommunityMembershipPayload;
      'community.userRemoved': Amity.CommunityMembershipPayload;
      'community.userChanged': Amity.CommunityMembershipPayload;
      'community.userBanned': Amity.CommunityMembershipPayload;
      'community.userUnbanned': Amity.CommunityMembershipPayload;
      'community.roleAdded': Amity.CommunityMembershipPayload;
      'community.roleRemoved': Amity.CommunityMembershipPayload;
    };

    type MqttCommunityEvents = {
      'community.created': Amity.CommunityPayload;
      'community.updated': Amity.CommunityPayload;
      'community.deleted': Amity.CommunityPayload;
    } & MqttCommunityUserEvents;

    type MqttPostEvents = {
      'post.created': Amity.PostPayload;
      'post.updated': Amity.PostPayload;
      'post.deleted': Amity.PostPayload;
      'post.approved': Amity.PostPayload;
      'post.declined': Amity.PostPayload;
      'post.flagged': Amity.PostPayload;
      'post.unflagged': Amity.PostPayload;
      'post.addReaction': Amity.PostPayload & { reactor: Amity.InternalReactor };
      'post.removeReaction': Amity.PostPayload & { reactor: Amity.InternalReactor };
    };

    type MqttCommentEvents = {
      'comment.created': Amity.CommentPayload;
      'comment.updated': Amity.CommentPayload;
      'comment.deleted': Amity.CommentPayload;
      'comment.flagged': Amity.CommentPayload;
      'comment.unflagged': Amity.CommentPayload;
      'comment.addReaction': Amity.CommentPayload & { reactor: Amity.InternalReactor };
      'comment.removeReaction': Amity.CommentPayload & { reactor: Amity.InternalReactor };
    };

    type MqttUserEvents = {
      'user.fetched': Amity.UserPayload;
      'user.updated': Amity.UserPayload;
      'user.deleted': Amity.UserPayload; // received from network topic
      'user.flagged': Amity.UserPayload;
      'user.unflagged': Amity.UserPayload;
      'user.flagCleared': Amity.UserPayload;
    };

    type MqttFollowEvents = {
      'follow.created': Amity.FollowersPayload;
      'follow.requested': Amity.FollowersPayload;
      'follow.accepted': Amity.FollowersPayload;
      'follow.unfollowed': Amity.FollowersPayload;
      'follow.requestCanceled': Amity.FollowersPayload;
      'follow.requestDeclined': Amity.FollowersPayload;
      'follow.followerDeleted': Amity.FollowersPayload;
    };

    type MqttMarkerEvents = {
      'marker.marked-message': Amity.MarkedMessagePayload;
      'marker.feed-updated': Amity.FeedUpdatedPayload;
      'marker.user-sync': Amity.UserMarkerSyncPayload;
      'marker.userFeed-updated': Amity.UserFeedUpdatedPayload;
    };

    type MqttRTE = MqttChannelEvents &
      MqttSubChannelEvents &
      MqttMessageEvents &
      MqttCommunityEvents &
      MqttPostEvents &
      MqttCommentEvents &
      MqttUserEvents &
      MqttFollowEvents &
      MqttMarkerEvents &
      MqttStoryEvents;

    type LocalPostEvents = {
      'local.post.updated': Amity.PostPayload;
      'local.post.deleted': Amity.PostPayload;
      'local.post.addReaction': { post: Amity.InternalPost } & { reactor: Amity.InternalReactor };
      'local.post.removeReaction': {
        post: Amity.InternalPost;
        reactor: Amity.InternalReactor;
      };
    };

    type LocalCommentEvents = {
      'local.comment.created': Amity.CommentPayload;
      'local.comment.deleted': Amity.CommentPayload;
      'local.comment.addReaction': { comment: Amity.InternalComment } & {
        reactor: Amity.InternalReactor;
      };
      'local.comment.removeReaction': {
        comment: Amity.InternalComment;
        reactor: Amity.InternalReactor;
      };
    };

    type LocalCommunityEvents = {
      'local.community.joined': Amity.CommunityMembershipPayload;
      'local.community.left': Amity.CommunityMembershipPayload;
      'local.community.roleAdded': Amity.ProcessedCommunityPayload;
      'local.community.roleRemoved': Amity.ProcessedCommunityPayload;
      'local.community.userAdded': Amity.CommunityMembershipPayload;
      'local.community.userRemoved': Amity.CommunityMembershipPayload;
    };

    type LocalFollowEvents = {
      'local.follow.created': Amity.FollowStatusPayload;
      'local.follow.requested': Amity.FollowStatusPayload;
      'local.follow.accepted': Amity.FollowStatusPayload;
      'local.follow.unfollowed': Amity.FollowStatusPayload;
      'local.follow.requestDeclined': Amity.FollowStatusPayload;
    };

    type LocalEvents = {
      'local.channel.updated': MakeRequired<Amity.ProcessedChannelPayload, 'channels'>;
      'local.channel.fetched': Amity.StaticInternalChannel[];
      'local.channel-moderator.role-added': Amity.ProcessedChannelPayload;
      'local.channel-moderator.role-removed': Amity.ProcessedChannelPayload;
      'local.message.created': MakeRequired<Amity.ProcessedMessagePayload, 'messages'>;
      'local.message.updated': MakeRequired<Amity.ProcessedMessagePayload, 'messages'>;
      'local.message.deleted': MakeRequired<Amity.ProcessedMessagePayload, 'messages'>;
      'local.message.fetched': MakeRequired<Amity.ProcessedMessagePayload, 'messages'>;
      'local.message-feed.updated': MakeRequired<Amity.ProcessedSubChannelPayload, 'messageFeeds'>;
      'local.message-feed.fetched': MakeRequired<Amity.ProcessedSubChannelPayload, 'messageFeeds'>;
      'local.message-feed.deleted': MakeRequired<Amity.ProcessedSubChannelPayload, 'messageFeeds'>;
      'poll.updated': MakeRequired<Amity.PollPayload, 'polls'>;
      'poll.deleted': MakeRequired<Amity.PollPayload, 'polls'>;
      'local.feedMarker.fetched': { feedMarkers: Amity.FeedMarker[] };
      'local.channelMarker.fetched': { userEntityMarkers: Amity.ChannelMarker[] };
      'local.channelMarker.updated': { userEntityMarkers: Amity.ChannelMarker[] };
      'local.subChannelMarker.fetched': { userFeedMarkers: Amity.SubChannelMarker[] };
      'local.subChannelMarker.updated': { userFeedMarkers: Amity.SubChannelMarker[] };
      'local.messageMarker.fetched': MakeRequired<Amity.MessageMarkerPayload, 'contentMarkers'>;
      'local.userMarker.fetched': { userMarkers: Amity.UserMarker[] };

      'local.userMessageFeedMarker.fetched': {
        userMessageFeedMarker: Amity.UserMessageFeedMarkerPayload;
      };

      'local.channel.resolved': Amity.StaticInternalChannel[];
      'local.userMessageFeedMarkers.resolved': {
        feedMarkers: Amity.FeedMarker[];
        userFeedMarkers: Amity.UserFeedMarkerResponse[];
      };

      'local.subChannelUnread.updated': Amity.SubChannelUnreadInfo;
      'local.channelUnreadInfo.updated': Amity.ChannelUnreadInfo;
      'local.channelUnread.updated': Amity.ChannelUnread;

      'local.story.created': Amity.StoryPayload;
      'local.story.updated': Amity.StoryPayload;
      'local.story.deleted': Amity.StoryPayload;

      'local.story.flagged': Amity.StoryPayload;
      'local.story.unflagged': Amity.StoryPayload;
      'local.story.reactionAdded': { story: Amity.InternalStory } & {
        reactor: Amity.InternalReactor;
      };
      'local.story.reactionRemoved': { story: Amity.InternalStory } & {
        reactor: Amity.InternalReactor;
      };

      'local.story.error': Amity.StoryPayload;
      'local.story.reload': { referenceIds: Amity.Story['referenceId'][] };

      'local.notificationTraySeen.updated': Amity.InternalNotificationTraySeen;
      'local.notificationTrayItem.updated': {
        notificationTrayItems: Amity.InternalNotificationTrayItem[];
      };

      sessionStateChange: Amity.SessionStates;
      // used by accessTokenExpiryWatcher
      tokenExpired: Amity.SessionStates.TOKEN_EXPIRED;
      tokenTerminated: Amity.SessionStates.TERMINATED;
      unreadCountEnabled: boolean;
    } & LocalPostEvents &
      LocalCommentEvents &
      LocalCommunityEvents &
      LocalFollowEvents;

    type Events = WsEvents & MqttEvents & MqttRTE & LocalEvents;
  }
}
