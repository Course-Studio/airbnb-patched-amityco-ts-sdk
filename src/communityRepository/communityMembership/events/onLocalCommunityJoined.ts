import { createLocalCommunityMemberEventSubscriber } from './utils';

export const onLocalCommunityJoined = (
  callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void,
) => createLocalCommunityMemberEventSubscriber('local.community.joined', callback);
