import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  follow21,
  follow11,
  user11,
  pause,
  date,
} from '~/utils/tests';

import { getFollowInfo } from '../getFollowInfo';

const FOLLOWING_COUNT = 2;
const getFollowInfoMePayload = ({
  userId = user11.userId,
  followerCount = 0,
  pendingCount = 0,
  followingCount = FOLLOWING_COUNT,
} = {}): Amity.FollowInfoMePayload => {
  return {
    followCounts: [
      {
        userId,
        followerCount,
        pendingCount,
        followingCount,
      },
    ],
  };
};

const getFollowMeStatusPayload = (
  status: Amity.FollowStatus['status'] = follow11.status,
): Amity.FollowStatusPayload => {
  return {
    follows: [
      {
        from: follow11.from,
        to: follow11.to,
        status,
        createdAt: date,
        updatedAt: date,
      },
    ],
  };
};

const getFollowStatusPayload = (
  status: Amity.FollowStatus['status'] = follow21.status,
): Amity.FollowStatusPayload => {
  return {
    follows: [
      {
        from: follow21.from,
        to: follow21.to,
        status,
        createdAt: date,
        updatedAt: date,
      },
    ],
  };
};

describe('getFollowInfo > me', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const tests: [
    string,
    keyof Amity.MqttFollowEvents,
    Amity.FollowStatusPayload,
    Amity.FollowInfoMePayload,
  ][] = [
    [
      'it should update follow info collection on accepted',
      'follow.accepted',
      getFollowMeStatusPayload('accepted'),
      getFollowInfoMePayload({ userId: user11.userId, followingCount: FOLLOWING_COUNT + 1 }),
    ],
    [
      'it should update follow info collection on unfollowed',
      'follow.unfollowed',
      getFollowMeStatusPayload('none'),
      getFollowInfoMePayload({ userId: user11.userId, followingCount: FOLLOWING_COUNT - 1 }),
    ],
    [
      'it should update follow info collection on requestDeclined',
      'follow.requestDeclined',
      getFollowMeStatusPayload('none'),
      getFollowInfoMePayload({ userId: user11.userId, followingCount: FOLLOWING_COUNT }),
    ],
    [
      'it should update follow info collection on followerDeleted',
      'follow.followerDeleted',
      getFollowMeStatusPayload('none'),
      getFollowInfoMePayload({ userId: user11.userId, followingCount: FOLLOWING_COUNT - 1 }),
    ],
  ];

  test.each(tests)('%s', async (description, event, payload, payloadFrom) => {
    const callback = jest.fn();

    client.http.get = jest
      .fn()
      .mockResolvedValueOnce({ data: getFollowInfoMePayload() })
      .mockResolvedValue({ data: payloadFrom });

    const unsub = getFollowInfo(user11.userId, callback);
    await pause();

    client.emitter.emit(event, payload);
    await pause();

    expect(callback).toHaveBeenCalled();

    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: payloadFrom.followCounts[0],
        loading: false,
      }),
    );

    unsub();
  });
});

describe('getFollowInfo > other', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const tests: [
    string,
    keyof Amity.MqttFollowEvents,
    Amity.FollowStatusPayload,
    Amity.FollowInfoMePayload,
  ][] = [
    [
      'it should update follow info collection on accepted',
      'follow.accepted',
      getFollowStatusPayload('accepted'),
      getFollowInfoMePayload({ userId: follow21.from, followingCount: FOLLOWING_COUNT + 1 }),
    ],
    [
      'it should update follow info collection on unfollowed',
      'follow.unfollowed',
      getFollowStatusPayload('none'),
      getFollowInfoMePayload({ userId: follow21.from, followingCount: FOLLOWING_COUNT - 1 }),
    ],
    [
      'it should update follow info collection on requestDeclined',
      'follow.requestDeclined',
      getFollowStatusPayload('none'),
      getFollowInfoMePayload({ userId: follow21.from, followingCount: FOLLOWING_COUNT }),
    ],
    [
      'it should update follow info collection on followerDeleted',
      'follow.followerDeleted',
      getFollowStatusPayload('none'),
      getFollowInfoMePayload({ userId: follow21.from, followingCount: FOLLOWING_COUNT - 1 }),
    ],
  ];

  test.each(tests)('%s', async (description, event, payload, payloadFrom) => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValueOnce({ data: getFollowInfoMePayload({ userId: follow21.from }) })
      .mockResolvedValue({ data: payloadFrom });

    const unsub = getFollowInfo(follow21.from, callback);
    await pause();

    client.emitter.emit(event, payload);
    await pause();

    expect(callback).toHaveBeenCalled();

    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: payloadFrom.followCounts[0],
        loading: false,
      }),
    );

    unsub();
  });
});
