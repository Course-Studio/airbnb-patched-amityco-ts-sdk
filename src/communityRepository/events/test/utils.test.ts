import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import {
  client,
  community11,
  communityUser11,
  connectClient,
  disconnectClient,
} from '~/utils/tests';

import { createCommunityEventSubscriber } from '../utils';

const event = 'community.created';
const communityToCreate = community11;

const eventPayload: Amity.CommunityPayload = {
  communities: [communityToCreate],
  communityUsers: [communityUser11],
  files: [],
  users: [],
  categories: [],
  feeds: [],
};

describe('createCommunityEventSubscriber', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('it should return event subscriber', () => {
    const callback = jest.fn();
    const received = createCommunityEventSubscriber(event, callback);

    expect(received).toBeDefined();
  });

  test('it should trigger callback with correctly params when cache is disabled', () => {
    disableCache();

    const callback = jest.fn();
    const unsub = createCommunityEventSubscriber(event, callback);
    client.emitter.emit(event, eventPayload);

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(communityToCreate);
  });

  test('it should trigger callback with correctly params when cache is enabled', () => {
    enableCache();

    const callback = jest.fn();
    const unsub = createCommunityEventSubscriber(event, callback);
    client.emitter.emit(event, eventPayload);

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(communityToCreate);

    disableCache();
  });

  test('it should ingest cache', () => {
    enableCache();

    const callback = jest.fn();
    const unsub = createCommunityEventSubscriber(event, callback);
    client.emitter.emit(event, eventPayload);

    unsub();

    const recieved = pullFromCache(['community', 'get', communityToCreate.communityId])?.data;

    expect(recieved).toEqual(communityToCreate);

    disableCache();
  });
});
