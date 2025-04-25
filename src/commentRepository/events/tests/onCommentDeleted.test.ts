import { client, comment11, textCommentPayload } from '~/utils/tests';
import { onCommentDeleted } from '../onCommentDeleted';
import { LinkedObject } from '~/utils/linkedObject';

describe('onCommentDeleted', () => {
  test('it should call callback when comment have created', () => {
    const callback = jest.fn();

    const unsub = onCommentDeleted(callback);
    client.emitter.emit('comment.deleted', textCommentPayload);

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(LinkedObject.comment(comment11));
  });

  test('it should return an unsubscriber', () => {
    const callback = jest.fn();

    const unsub = onCommentDeleted(callback);
    unsub();

    client.emitter.emit('comment.deleted', textCommentPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
