import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  follow21,
  follow11,
  pause,
  date,
} from '~/utils/tests';

import { getMyFollowInfo } from '../getMyFollowInfo';

const FOLLOWING_COUNT = 2;
const getMyFollowInfoMePayload = ({
  userId = client.userId!,
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

describe('getMyFollowInfo > me', () => {
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
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT + 1 }),
    ],
    [
      'it should update follow info collection on unfollowed',
      'follow.unfollowed',
      getFollowMeStatusPayload('none'),
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT - 1 }),
    ],
    [
      'it should update follow info collection on requestDeclined',
      'follow.requestDeclined',
      getFollowMeStatusPayload('none'),
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT }),
    ],
    [
      'it should update follow info collection on followerDeleted',
      'follow.followerDeleted',
      getFollowMeStatusPayload('none'),
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT - 1 }),
    ],
  ];

  test.each(tests)('%s', async (description, event, payload, payloadFrom) => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue({ data: getMyFollowInfoMePayload() })
      .mockResolvedValueOnce({ data: payloadFrom })
      .mockResolvedValueOnce({ data: payloadFrom });

    const unsub = getMyFollowInfo(callback);
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

describe('getMyFollowInfo > other', () => {
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
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT + 1 }),
    ],
    [
      'it should update follow info collection on unfollowed',
      'follow.unfollowed',
      getFollowStatusPayload('none'),
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT - 1 }),
    ],
    [
      'it should update follow info collection on requestDeclined',
      'follow.requestDeclined',
      getFollowStatusPayload('none'),
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT }),
    ],
    [
      'it should update follow info collection on followerDeleted',
      'follow.followerDeleted',
      getFollowStatusPayload('none'),
      getMyFollowInfoMePayload({ followingCount: FOLLOWING_COUNT - 1 }),
    ],
  ];

  test.each(tests)('%s', async (description, event, payload, payloadFrom) => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue({ data: getMyFollowInfoMePayload() })
      .mockResolvedValueOnce({ data: payloadFrom })
      .mockResolvedValueOnce({ data: payloadFrom });

    const unsub = getMyFollowInfo(callback);
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
