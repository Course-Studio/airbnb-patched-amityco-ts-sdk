import { pushToCache } from '~/cache/api';

export const saveCommunityUsers = (
  communities: Amity.CommunityPayload['communities'],
  communityUsers: Amity.CommunityPayload['communityUsers'],
) => {
  if (communities.length === 0 || communityUsers.length === 0) return;

  communities.forEach(({ communityId }) => {
    const collection = communityUsers.filter(
      ({ communityId: userCommunityId }) => communityId === userCommunityId,
    );

    pushToCache(['communityUsers', 'collection', communityId], collection);
  });
};
