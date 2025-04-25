import { createLocalCommunityMemberEventSubscriber } from './utils';

export const onLocalCommunityLeft = (
  callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void,
) => createLocalCommunityMemberEventSubscriber('local.community.left', callback);
