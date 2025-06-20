import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { getResolver } from '~/core/model';
import { withUser } from '~/group/utils';
import {
  client,
  community11,
  communityUser11,
  connectClient,
  disconnectClient,
  user11,
} from '~/utils/tests';

import { createCommunityMemberEventSubscriber } from '../utils';
import { updateMembershipStatus } from '../../../utils/communityWithMembership';

const communityToCreate = community11;
const event2 = 'community.userAdded';
const communityToAddUser = community11;
const addedUserRaw = communityUser11;
const addedUser = withUser(addedUserRaw);

const eventPayload2: Amity.CommunityMembershipPayload = {
  communities: [communityToAddUser],
  communityUsers: [addedUserRaw],
  files: [],
  users: [user11],
  categories: [],
  feeds: [],
};

describe('createCommunityMemberEventSubscriber', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('it should return event subscriber', () => {
    const callback = jest.fn();
    const received = createCommunityMemberEventSubscriber(event2, callback);

    expect(received).toBeDefined();
  });

  test('it should trigger callback with correctly params when cache is disabled', () => {
    disableCache();

    const callback = jest.fn();
    const unsub = createCommunityMemberEventSubscriber(event2, callback);
    client.emitter.emit(event2, eventPayload2);

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith({ ...communityToAddUser, isJoined: true }, addedUser);
  });

  test('it should trigger callback with correctly params when cache is enabled', () => {
    enableCache();

    const callback = jest.fn();
    const unsub = createCommunityMemberEventSubscriber(event2, callback);
    client.emitter.emit(event2, eventPayload2);

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith({ ...communityToCreate, isJoined: true }, addedUser);

    disableCache();
  });

  test('it should ingest cache', () => {
    enableCache();

    const callback = jest.fn();
    const unsub = createCommunityMemberEventSubscriber(event2, callback);
    client.emitter.emit(event2, eventPayload2);

    unsub();

    const recieved = pullFromCache([
      'communityUsers',
      'get',
      getResolver('communityUsers')({
        communityId: communityToAddUser.communityId,
        userId: addedUser.userId,
      }),
    ])?.data;

    expect(recieved).toEqual(addedUser);

    disableCache();
  });
});

describe('updateMembershipStatus', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  const communities = [
    {
      communityId: 'test-membership',
    } as Amity.Community,
  ];

  const getCommunityUsers = (membership = 'member') => [
    {
      communityId: 'test-membership',
      communityMembership: membership,
      userId: client?.userId || 'test',
    } as Amity.Membership<'community'>,
    {
      communityId: 'test-membership',
      communityMembership: 'member',
      userId: 'some-other-user',
    } as Amity.Membership<'community'>,
  ];

  test('it should update isJoined status to true if membership member', () => {
    const expected = { ...communities[0], isJoined: true };
    const recieved = updateMembershipStatus(communities, getCommunityUsers())[0];

    expect(recieved).toStrictEqual(expected);
  });

  test('it should update isJoined status to true if membership banned', () => {
    const expected = { ...communities[0], isJoined: true };
    const recieved = updateMembershipStatus(communities, getCommunityUsers('banned'))[0];

    expect(recieved).toStrictEqual(expected);
  });

  test('it should update isJoined status to false if membership none', () => {
    const expected = { ...communities[0], isJoined: false };
    const recieved = updateMembershipStatus(communities, getCommunityUsers('none'))[0];

    expect(recieved).toStrictEqual(expected);
  });
});
