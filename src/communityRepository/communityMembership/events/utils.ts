import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { pullFromCache } from '~/cache/api';
import { getResolver } from '~/core/model';

import { prepareCommunityPayload } from '../../utils';
import { updateMembershipStatus } from '../../utils/communityWithMembership';
import { isNonNullable } from '~/utils';

function hasPermission(
  member: Amity.Membership<'community'>,
  payload: {
    communityUsers: Amity.Membership<'community'>[];
  },
  permission: string,
) {
  if (member.permissions.some(x => x === permission)) {
    return true;
  }

  return payload
    .communityUsers!.find(user => user.userId === member.userId)!
    .permissions.some(x => x === permission);
}

function getEventRelatedMember(
  event: keyof Amity.MqttCommunityUserEvents | keyof Amity.LocalCommunityEvents,
  payload: {
    communityUsers: Amity.Membership<'community'>[];
    users: Amity.InternalUser[];
  },
) {
  if (event === 'community.joined' || event === 'community.left') {
    return payload.communityUsers;
  }

  if (event === 'community.userRemoved' || event === 'local.community.userRemoved') {
    return payload.communityUsers!.filter(x => x.communityMembership === 'none');
  }

  if (event === 'community.userBanned') {
    return payload.communityUsers!.filter(x => x.communityMembership === 'banned');
  }

  // NOTE: it might be that in certain edge cases permission check won't be enough
  if (event === 'community.userUnbanned') {
    return payload.communityUsers!.filter(x => !hasPermission(x, payload, 'BAN_COMMUNITY_USER'));
  }

  return payload.communityUsers!.filter(x => !hasPermission(x, payload, 'ADD_COMMUNITY_USER'));
}

export const createCommunityMemberEventSubscriber = (
  event: keyof Amity.MqttCommunityUserEvents,
  callback: (community: Amity.Community, members: Amity.Membership<'community'>[]) => void,
) => {
  const client = getActiveClient();

  const filter = (payload: Amity.CommunityMembershipPayload) => {
    const preparedPayload = prepareCommunityPayload(payload);
    const { communities, communityUsers } = preparedPayload;

    /*
     * community.isJoined is not part of the communityMembership payload, and needs
     * to be calculated based on the communityMembership value
     */
    const communitiesWithMembership = updateMembershipStatus(communities, communityUsers);

    preparedPayload.communities = communitiesWithMembership;

    if (!client.cache) {
      // TODO: here we are missing specific properties here!
      callback(preparedPayload.communities[0], getEventRelatedMember(event, preparedPayload));
    } else {
      // NOTE: The event payload should be merge with existing cache data
      ingestInCache(preparedPayload, undefined, false);

      const community = pullFromCache<Amity.Community>([
        'community',
        'get',
        preparedPayload.communities[0].communityId,
      ])!;

      const members = getEventRelatedMember(event, preparedPayload)
        .map(member => {
          const memberCache = pullFromCache<Amity.Membership<'community'>>([
            'communityUsers',
            'get',
            getResolver('communityUsers')(member),
          ]);
          return memberCache?.data;
        })
        .filter(isNonNullable);

      callback(community.data, members);
    }
  };

  return createEventSubscriber(client, event, event, filter);
};

export const createLocalCommunityMemberEventSubscriber = (
  event: keyof Amity.LocalCommunityEvents,
  callback: (community: Amity.Community, members: Amity.Membership<'community'>[]) => void,
) => {
  const client = getActiveClient();

  const filter = (payload: Amity.CommunityMembershipPayload) => {
    const preparedPayload = prepareCommunityPayload(payload);
    const { communities, communityUsers } = preparedPayload;

    /*
     * community.isJoined is not part of the communityMembership payload, and needs
     * to be calculated based on the communityMembership value
     */
    const communitiesWithMembership = updateMembershipStatus(communities, communityUsers);

    preparedPayload.communities = communitiesWithMembership;

    if (!client.cache) {
      // TODO: here we are missing specific properties here!
      callback(preparedPayload.communities[0], getEventRelatedMember(event, preparedPayload));
    } else {
      // NOTE: The event payload should be merge with existing cache data
      ingestInCache(preparedPayload, undefined, false);

      const community = pullFromCache<Amity.Community>([
        'community',
        'get',
        preparedPayload.communities[0].communityId,
      ])!;

      const members = getEventRelatedMember(event, preparedPayload)
        .map(member => {
          const memberCache = pullFromCache<Amity.Membership<'community'>>([
            'communityUsers',
            'get',
            getResolver('communityUsers')(member),
          ]);
          return memberCache?.data;
        })
        .filter(isNonNullable);

      callback(community.data, members);
    }
  };

  return createEventSubscriber(client, event, event, filter);
};
