import {
  client,
  connectClient,
  disconnectClient,
  postPayload,
  post11,
  reactor11,
} from '~/utils/tests';

import { onPostReactionRemoved } from '../onPostReactionRemoved';

describe('onPostReactionRemoved', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  test('it should got event after reaction got removed from post', () => {
    const callback = jest.fn();
    const unsub = onPostReactionRemoved(callback);
    client.emitter.emit('post.removeReaction', { ...postPayload, reactor: reactor11 });

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(post11);
  });

  test('it should got nothing if we did unsubscribe before got event', () => {
    const callback = jest.fn();
    const unsub = onPostReactionRemoved(callback);

    unsub();

    client.emitter.emit('post.removeReaction', { ...postPayload, reactor: reactor11 });
    expect(callback).not.toHaveBeenCalled();
  });
});
