import { client, comment11, textCommentPayload } from '~/utils/tests';
import { onCommentCreated } from '../onCommentCreated';
import { LinkedObject } from '~/utils/linkedObject';

describe('onCommentCreated', () => {
  test('it should call callback when comment have created', () => {
    const callback = jest.fn();

    const unsub = onCommentCreated(callback);
    client.emitter.emit('comment.created', textCommentPayload);

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(LinkedObject.comment(comment11));
  });

  test('it should return an unsubscriber', () => {
    const callback = jest.fn();

    const unsub = onCommentCreated(callback);
    unsub();

    client.emitter.emit('comment.created', textCommentPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
