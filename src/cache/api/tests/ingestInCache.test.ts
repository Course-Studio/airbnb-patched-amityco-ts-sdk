import { prepareCommunityPayload } from '~/communityRepository/utils';
import { PAYLOAD2MODEL, getResolver } from '~/core/model';

import {
  userPayload,
  rolePayload,
  channelPayload,
  messagePayload,
  communityPayload,
  postPayload,
  pollPayload,
  followPayload,
  feedPayload,
  user11,
} from '~/utils/tests';

import { enableCache, disableCache, pullFromCache } from '..';
import { ingestInCache } from '../ingestInCache';

describe('ingestInCache', () => {
  beforeAll(enableCache);
  afterAll(disableCache);

  const payloads: [keyof Amity.Models, Record<string, Amity.Model[]>][] = [
    ['user', userPayload],
    ['role', rolePayload],
    ['channel', channelPayload],
    ['message', messagePayload],
    ['community', prepareCommunityPayload(communityPayload)],
    ['post', postPayload],
    // FIXME: add support for commentChildren in model
    // ['comment', textCommentPayload],
    ['poll', pollPayload],
    // FIXME: correct reactions type in model
    // ['reaction', reactionPayload],
    ['follow', followPayload],
    ['feed', feedPayload],
  ];

  test.each(payloads)('it should add %s payload to cache', (model, payload) => {
    ingestInCache(payload);

    Object.entries(payload).forEach(([k, v]) => {
      const type = PAYLOAD2MODEL[k];
      const resolver = getResolver(type);

      expect(type).toBeDefined();

      v.forEach(entity => {
        const received = pullFromCache([type, 'get', resolver(entity)]);
        return expect(received).toBeDefined();
      });
    });
  });

  test('it should not update cache if model invalid', () => {
    const invalidPayload = {
      invalids: [{ invalidId: 'invalidId' }],
      users: [user11],
    };

    // @ts-ignore
    ingestInCache(invalidPayload);

    expect(pullFromCache(['invalid', 'get', 'invalidId'])).toBeUndefined();
    expect(pullFromCache(['user', 'get', user11.userId])).toBeDefined();
  });
});

describe('ingestInCache -> cachedAt', () => {
  beforeAll(enableCache);
  afterAll(disableCache);

  test('it should update cache if cachedAt is valid', () => {
    const now = Date.now();
    ingestInCache(userPayload, { cachedAt: now });

    const { data, cachedAt } = pullFromCache(['user', 'get', user11.userId])!;

    expect(data).toBeDefined();
    expect(cachedAt).toBe(now);
  });

  test('it should update cache if cachedAt is expired', () => {
    ingestInCache(userPayload, { cachedAt: -1 });

    const { data, cachedAt } = pullFromCache(['user', 'get', user11.userId])!;

    expect(data).toBeDefined();
    expect(cachedAt).toBe(-1);
  });
});
