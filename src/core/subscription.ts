import { getActiveClient } from '~/client/api/activeClient';
import { ASCError } from '~/core/errors';
import { getActiveUser } from '~/client/api/activeUser';
import { modifyMqttConnection } from '~/client/utils/modifyMqttConnection';

export enum SubscriptionLevels {
  COMMUNITY = 'community',
  POST = 'post',
  COMMENT = 'comment',
  POST_AND_COMMENT = 'post_and_comment',
  USER = 'user',
}

const getCommunityUserTopic = (
  path: Amity.Subscribable['path'],
  level?: SubscriptionLevels,
): string => {
  switch (level) {
    case 'post':
      return `${path}/post/+`;
    case 'comment':
      return `${path}/post/+/comment/+`;
    case 'post_and_comment':
      return `${path}/post/#`;
    default:
      return path;
  }
};

const getNetworkId = (user: { path: string }): string => user.path.split('/user/')[0];

export const getCommunityTopic = (
  { path }: Amity.Subscribable,
  level: Exclude<SubscriptionLevels, SubscriptionLevels.USER> = SubscriptionLevels.COMMUNITY,
): string => getCommunityUserTopic(path, level);

export const getUserTopic = (
  { path }: Amity.Subscribable,
  level: Exclude<SubscriptionLevels, SubscriptionLevels.COMMUNITY> = SubscriptionLevels.USER,
): string =>
  getCommunityUserTopic(
    level === SubscriptionLevels.USER ? path : path.replace(/^(\w*)/, '$1/social'),
    level,
  );

export const getPostTopic = (
  { path }: Amity.Subscribable,
  level: SubscriptionLevels.POST | SubscriptionLevels.COMMENT = SubscriptionLevels.POST,
): string => {
  switch (level) {
    case 'comment':
      return `${path}/comment/+`;
    default:
      return path;
  }
};

export const getCommentTopic = ({ path }: Amity.Subscribable): string => {
  return path;
};

// Subscribe on comment and story update on a single story
export const getStoryTopic = ({
  targetId,
  targetType,
  storyId,
}: Pick<Amity.Story, 'targetId' | 'targetType' | 'storyId'>): string => {
  const user = getActiveUser();
  return `${getNetworkId(user)}/social/${targetType}/${targetId}/story/${storyId}/#`;
};

// Subscribe on comment and story update on stories under community
export const getCommunityStoriesTopic = ({
  targetId,
  targetType,
}: Pick<Amity.Story, 'targetId' | 'targetType'>): string => {
  const user = getActiveUser();
  return `${getNetworkId(user)}/social/${targetType}/${targetId}/story/#`;
};

export const getMyFollowersTopic = (): string => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/membership/${user._id}/+/+`;
};

export const getMyFollowingsTopic = (): string => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/membership/+/${user._id}/+`;
};

export const getChannelTopic = (channel: Amity.Subscribable): string => `${channel.path}/#`;

export const getSubChannelTopic = (subChannel: Amity.Subscribable): string =>
  `${subChannel.path}/#`;

export const getMessageTopic = (message: Amity.Subscribable): string => message.path;

export const getMarkedMessageTopic = ({
  channelId,
  subChannelId,
}: Pick<Amity.SubChannel, 'channelId' | 'subChannelId'>): string => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/marker/channel/${channelId}/message/${subChannelId}`;
};

export const getMarkerUserFeedTopic = () => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/marker/user/${user._id}`;
};

/**
 * @hidden
 *
 * Create a topic to subscribe to network level events like 'user is deleted from the network'
 */
export const getNetworkTopic = (): string => {
  return getNetworkId(getActiveUser());
};

/**
 * @hidden
 *
 * Create a topic to subscribe to channel events for 'conversation', 'community' channel
 */
export const getSmartFeedChannelTopic = (): string => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/smartfeed/${user._id}/channels`;
};

/**
 * @hidden
 *
 * Create a topic to subscribe to sub channel events for 'conversation', 'community' channel
 */
export const getSmartFeedSubChannelTopic = (): string => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/smartfeed/${user._id}/messagefeeds`;
};

/**
 * @hidden
 *
 * Create a topic to subscribe to message events for 'conversation', 'community' channel
 */
export const getSmartFeedMessageTopic = (): string => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/smartfeed/${user._id}/messages`;
};

let mqttAccessToken: string;
let mqttUserId: string;

export function subscribeTopic(
  topic: string,
  callback?: Amity.Listener<ASCError | void>,
): Amity.Unsubscriber {
  const { mqtt } = getActiveClient();
  if (!mqtt) return () => null;

  modifyMqttConnection();

  return mqtt.subscribe(topic, callback);
}

export const getLiveStreamTopic = (): string => {
  const user = getActiveUser();

  return `${getNetworkId(user)}/videostreaming`;
};
