import { client, generateRawMessage, pause } from '~/utils/tests';
import { convertFromRaw } from '~/messageRepository/utils';
import {
  onMessageCreatedMqtt,
  onMessageUpdated,
  onMessageDeleted,
  onMessageFlagged,
  onMessageUnflagged,
  onMessageFlagCleared,
  onMessageReactionAdded,
  onMessageReactionRemoved,
} from '..';

describe('Message Events', () => {
  const rawMessage = generateRawMessage();
  const message = convertFromRaw(rawMessage);

  const cases: Array<
    [
      (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber,
      keyof Amity.MqttMessageEvents,
    ]
  > = [
    [onMessageCreatedMqtt, 'message.created'],
    [onMessageUpdated, 'message.updated'],
    [onMessageDeleted, 'message.deleted'],
    [onMessageFlagged, 'message.flagged'],
    [onMessageUnflagged, 'message.unflagged'],
    [onMessageFlagCleared, 'message.flagCleared'],
    [onMessageReactionAdded, 'message.reactionAdded'],
    [onMessageReactionRemoved, 'message.reactionRemoved'],
  ];

  cases.forEach(([onEvent, event]) => {
    test(`should call '${onEvent.name}' callback if '${event}' event is dispatched`, async () => {
      const callback = jest.fn();
      const unsubscribe = onEvent(callback);
      client.emitter.emit(event, {
        messages: [rawMessage],
        messageFeeds: [],
        files: [],
        users: [],
        reactions: [],
      });

      await pause();

      unsubscribe();

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(message);
    });

    test(`should not call '${onEvent.name}' callback if we have already unsubscribed`, () => {
      const callback = jest.fn();
      const unsubscribe = onEvent(callback);

      unsubscribe();
      client.emitter.emit(event, {
        files: [],
        users: [],
        reactions: [],
        messages: [rawMessage],
        messageFeeds: [],
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
