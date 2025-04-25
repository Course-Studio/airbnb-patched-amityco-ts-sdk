/** @hidden */
export declare const createEventEmitter: () => import("mitt").Emitter<Amity.Events>;
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
export declare const proxyWebsocketEvents: (ws: Amity.Client["ws"], emitter: Amity.Client["emitter"]) => void;
export declare const proxyMqttEvents: (mqttClient: Amity.Client["mqtt"], emitter: Amity.Client["emitter"]) => void;
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
export declare const createEventSubscriber: <T extends keyof Amity.Events>(client: Amity.Client, namespace: string, event: T, fn: Amity.Listener<Amity.Events[T]>) => Amity.Unsubscriber;
export declare const createMqttMessageSubscriber: <T extends keyof Amity.Events>(client: Amity.Client, namespace: string, event: T, fn: (params: Record<string, unknown>) => void) => Amity.Unsubscriber;
/**
 * Wrapper around dispatch event
 *
 * @hidden
 */
export declare const fireEvent: <T extends keyof Amity.Events>(event: T, payload: Amity.Events[T]) => void;
