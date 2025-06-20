import { ASCError } from '~/core/errors';
export declare enum SubscriptionLevels {
    COMMUNITY = "community",
    POST = "post",
    COMMENT = "comment",
    POST_AND_COMMENT = "post_and_comment",
    USER = "user"
}
export declare const getCommunityTopic: ({ path }: Amity.Subscribable, level?: Exclude<SubscriptionLevels, SubscriptionLevels.USER>) => string;
export declare const getUserTopic: ({ path }: Amity.Subscribable, level?: Exclude<SubscriptionLevels, SubscriptionLevels.COMMUNITY>) => string;
export declare const getPostTopic: ({ path }: Amity.Subscribable, level?: SubscriptionLevels.POST | SubscriptionLevels.COMMENT) => string;
export declare const getCommentTopic: ({ path }: Amity.Subscribable) => string;
export declare const getStoryTopic: ({ targetId, targetType, storyId, }: Pick<Amity.Story, "targetId" | "targetType" | "storyId">) => string;
export declare const getCommunityStoriesTopic: ({ targetId, targetType, }: Pick<Amity.Story, "targetId" | "targetType">) => string;
export declare const getMyFollowersTopic: () => string;
export declare const getMyFollowingsTopic: () => string;
export declare const getChannelTopic: (channel: Amity.Subscribable) => string;
export declare const getSubChannelTopic: (subChannel: Amity.Subscribable) => string;
export declare const getMessageTopic: (message: Amity.Subscribable) => string;
export declare const getMarkedMessageTopic: ({ channelId, subChannelId, }: Pick<Amity.SubChannel, "channelId" | "subChannelId">) => string;
export declare const getMarkerUserFeedTopic: () => string;
/**
 * @hidden
 *
 * Create a topic to subscribe to network level events like 'user is deleted from the network'
 */
export declare const getNetworkTopic: () => string;
/**
 * @hidden
 *
 * Create a topic to subscribe to channel events for 'conversation', 'community' channel
 */
export declare const getSmartFeedChannelTopic: () => string;
/**
 * @hidden
 *
 * Create a topic to subscribe to sub channel events for 'conversation', 'community' channel
 */
export declare const getSmartFeedSubChannelTopic: () => string;
/**
 * @hidden
 *
 * Create a topic to subscribe to message events for 'conversation', 'community' channel
 */
export declare const getSmartFeedMessageTopic: () => string;
export declare function subscribeTopic(topic: string, callback?: Amity.Listener<ASCError | void>): Amity.Unsubscriber;
export declare const getLiveStreamTopic: () => string;
