/* eslint-disable @typescript-eslint/no-unused-vars */
import mitt from 'mitt';

import { getActiveClient } from '~/client/api/activeClient';

import { scheduleTask } from './microtasks';

// need to sync up the list
const WS_EVENTS = [
  'disconnected',
  'error',
  'connect_error',
  'reconnect_error',
  'reconnect_failed',
  'sessionStateChange',
  // for internal use by accessTokenExpiryWatcher
  'tokenExpired',
] as const;

const MQTT_EVENTS = [
  'connect',
  'message',
  'disconnect',
  'error',
  'close',
  'end',
  'reconnect',

  'video-streaming.didStart',
  'video-streaming.didRecord',
  'video-streaming.didStop',
  'video-streaming.didFlag',
  'video-streaming.didTerminate',

  // 'user.didGlobalBan' remove due to message event,
] as const;

/** @hidden */
export const createEventEmitter = () => {
  return mitt<Amity.Events>();
};

/**
 * Wraps the websocket events into the client's event emitter for
 * abstraction of transport.
 *
 * @param ws A websocket connection to listen from
 * @param emitter An event emitter to wire the events to
 *
 * @category Transport
 * @hidden
 */
export const proxyWebsocketEvents = (ws: Amity.Client['ws'], emitter: Amity.Client['emitter']) => {
  WS_EVENTS.forEach(event => {
    ws?.on(event, (param: Amity.Events[typeof event]) => {
      emitter.emit(event, param);
    });
  });
};

export const proxyMqttEvents = (
  mqttClient: Amity.Client['mqtt'],
  emitter: Amity.Client['emitter'],
) => {
  MQTT_EVENTS.forEach(event => {
    mqttClient?.on(event, (...params: any[]) => {
      emitter.emit(event, params.length === 1 ? params[0] : params);
    });
  });

  // @ts-ignore
  mqttClient.on('message', (topic: string, payload: Buffer) => {
    const message = JSON.parse(payload.toString());
    emitter.emit(message.eventType, message.data);
  });
};

/**
 * Standardize the subscription of SSE through web sockets
 *
 * @param client The current client for which to subscribe the event to
 * @param namespace A unique name for the logger
 * @param event The websocket event name
 * @param fn A wrapper for the callback.
 * @returns A dispose function to unsubscribe to the event
 *
 * @category Transport
 * @hidden
 */
export const createEventSubscriber = <T extends keyof Amity.Events>(
  client: Amity.Client,
  namespace: string,
  event: T,
  fn: Amity.Listener<Amity.Events[T]>,
): Amity.Unsubscriber => {
  const { log, emitter } = client;

  const timestamp = Date.now();
  log(`${namespace}(tmpid: ${timestamp}) > listen`);

  const handler = (...payload: Parameters<typeof fn>) => {
    log(`${namespace}(tmpid: ${timestamp}) > trigger`, payload);

    try {
      fn(...payload);
    } catch (e) {
      log(`${namespace}(tmpid: ${timestamp}) > error`, e);
    }
  };

  emitter.on(event, handler);

  return () => {
    log(`${namespace}(tmpid: ${timestamp}) > dispose`);
    emitter.off(event, handler);
  };
};

export const createMqttMessageSubscriber = <T extends keyof Amity.Events>(
  client: Amity.Client,
  namespace: string,
  event: T,
  fn: (params: Record<string, unknown>) => void,
): Amity.Unsubscriber => {
  return createEventSubscriber(client, namespace, 'message', ([topic, message]) => {
    const payload = JSON.parse(message.toString());

    if (payload.eventType === event) {
      fn(payload.data);
    }
  });
};

/**
 * Wrapper around dispatch event
 *
 * @hidden
 */
export const fireEvent = <T extends keyof Amity.Events>(event: T, payload: Amity.Events[T]) => {
  const { emitter } = getActiveClient();
  scheduleTask(() => {
    emitter.emit(event, payload);
  });
};
