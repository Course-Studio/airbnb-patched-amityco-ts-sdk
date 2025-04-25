import {
  client,
  connectClient,
  disconnectClient,
  postPayload,
  post11,
  reactor11,
} from '~/utils/tests';

import { onPostReactionAdded } from '../onPostReactionAdded';

describe('onPostReactionAdded', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  test('it should got event after add reaction to post', () => {
    const callback = jest.fn();
    const unsub = onPostReactionAdded(callback);
    client.emitter.emit('post.addReaction', { ...postPayload, reactor: reactor11 });

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith({ ...post11, myReactions: [reactor11.reactionName] });
  });

  test('it should got nothing if we did unsubscribe before got event', () => {
    const callback = jest.fn();
    const unsub = onPostReactionAdded(callback);

    unsub();

    client.emitter.emit('post.addReaction', { ...postPayload, reactor: reactor11 });
    expect(callback).not.toHaveBeenCalled();
  });
});
