/**
 * Manually computed type which links each key with array
 * of matching keys as values. The type is computed rather
 * than letting string[] to help identifying mistakes while
 * adding new models.
 * @hidden
 */
type Criterias<T extends Amity.Domain = Amity.Domain> = {
  [K in T]?: (keyof Amity.Models[K])[];
};

/**
 * Identification criterias
 *
 * As key, the name of the identified model ;
 * As value, the list of properties to consider a given model as of type
 *
 * Used as source of truth for {@link identifyModel}
 *
 * @hidden
 */
const CRITERIAS: Criterias = {
  file: ['fileId', 'attributes'],
  user: ['userId', 'avatarFileId', 'roles', 'permissions'],
  role: ['roleId'],
  channel: ['channelId', 'defaultSubChannelId'],
  subChannel: ['subChannelId', 'latestMessageId'],
  channelUsers: ['channelId', 'userId', 'membership'],
  message: ['messageId'],
  community: ['communityId', 'postSetting'],
  category: ['categoryId'],
  communityUsers: ['userId', 'communityId', 'communityMembership'],
  post: ['postId', 'feedId'],
  comment: ['commentId', 'referenceId'],
  poll: ['pollId'],
  reaction: ['referenceId', 'referenceType', 'reactors'],
  reactor: ['reactionId'],
  stream: ['streamId'],
  follow: ['from', 'to'],
  feed: ['feedId', 'feedType'],
  followInfo: ['userId', 'status'],
  followCount: ['userId', 'followerCount'],
};

/** @hidden */
const hasKeys = (object: Record<string, unknown>, needles: string[]) => {
  const haystack = Object.keys(object);
  return needles.every(needle => haystack.includes(needle));
};

/**
 * Finds the name of the store for a given unknown model
 *
 * @param model one of the {@link Amity.Models} to identify
 * @returns the name of the corresponding store
 */
export const identifyModel = (model: Record<string, unknown>) => {
  // we cannot avoid "as" in here because Object.entries does not
  // allow anything else than "string" as key in the iterator type
  const criterias = Object.entries(CRITERIAS) as [Amity.Domain, string[]][];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return criterias.find(([_, keys]) => hasKeys(model, keys))?.[0];
};

/*
 * Identify the modal key for a model
 * Used to get args for optimistic updates
 * Example: createMessage: get messageId on optimistic message creation
 *
 * @param model to be recognized
 * @returns model key array if one if found or undefined
 */
export const identifyModelKey = (model: Record<string, unknown>): string | undefined => {
  const modalKey = identifyModel(model);

  if (!modalKey) {
    return undefined;
  }

  return CRITERIAS[modalKey]?.[0];
};
