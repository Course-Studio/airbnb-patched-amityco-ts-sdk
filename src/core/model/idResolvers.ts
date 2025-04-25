/**
 * Manually computed type which links each key with a function
 * used to return the object's unique id. The type is computed
 * to avoid using any and give some typing security at the
 * resolver's level.
 */
type Resolver<T extends Amity.Domain> = (model: Amity.Minimal[T]) => string;
type Resolvers<T extends Amity.Domain = Amity.Domain> = {
  [K in T]: Resolver<K>;
};

/** @hidden */
const idResolvers: Resolvers = {
  user: ({ userId }) => userId,
  file: ({ fileId }) => fileId,
  role: ({ roleId }) => roleId,

  channel: ({ channelInternalId }) => channelInternalId,
  subChannel: ({ subChannelId }) => subChannelId,
  channelUsers: ({ channelId, userId }) => `${channelId}#${userId}`,
  message: ({ messageId, referenceId }) => referenceId ?? messageId,

  messagePreviewChannel: ({ channelId }) => `${channelId}`,
  messagePreviewSubChannel: ({ subChannelId }) => `${subChannelId}`,

  channelUnreadInfo: ({ channelId }) => channelId,
  subChannelUnreadInfo: ({ subChannelId }) => subChannelId,

  channelUnread: ({ channelId }) => channelId,

  channelMarker: ({ entityId, userId }) => `${entityId}#${userId}`,
  subChannelMarker: ({ entityId, feedId, userId }) => `${entityId}#${feedId}#${userId}`,
  messageMarker: ({ feedId, contentId, creatorId }) => `${feedId}#${contentId}#${creatorId}`,
  feedMarker: ({ feedId, entityId }) => `${feedId}#${entityId}`,

  userMarker: ({ userId }) => userId,

  community: ({ communityId }) => communityId,
  category: ({ categoryId }) => categoryId,
  communityUsers: ({ communityId, userId }) => `${communityId}#${userId}`,
  post: ({ postId }) => postId,
  comment: ({ commentId }) => commentId,
  commentChildren: ({ commentId }) => commentId,
  poll: ({ pollId }) => pollId,
  reaction: ({ referenceType, referenceId }) => `${referenceType}#${referenceId}`,
  reactor: ({ reactionId }) => reactionId,

  stream: ({ streamId }) => streamId,
  streamModeration: ({ streamId }) => streamId,

  follow: ({ from, to }) => `${from}#${to}`,
  followInfo: ({ userId }) => userId,
  followCount: ({ userId }) => userId,

  feed: ({ targetId, feedId }) => `${targetId}#${feedId}`,
  story: ({ referenceId }) => referenceId!,
  storyTarget: ({ targetId }) => targetId,

  ad: ({ adId }) => adId,
  advertiser: ({ advertiserId }) => advertiserId,

  pin: ({ placement, referenceId }) => `${placement}#${referenceId}`,
  pinTarget: ({ targetId }) => targetId,

  notificationTrayItem: ({ _id }) => _id,
  notificationTraySeen: ({ userId }) => userId,
};

/**
 * Retrieve the id resolver matching a domain name
 *
 * @param name the domain name for the resolve
 * @returns an idResolver function for the given domain name
 */
export const getResolver = <T extends Amity.Domain>(name: T): Resolver<T> => idResolvers[name];
