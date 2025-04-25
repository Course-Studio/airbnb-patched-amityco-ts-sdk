/* eslint-disable no-console */
/* eslint-disable no-promise-executor-return */
import mqtt, { IClientOptions, ISubscriptionGrant, MqttClient } from 'mqtt/dist/mqtt';
import { subscribeGlobalTopic } from '~/client/utils/subscribeGlobalTopic';
import { ASCError, ASCUnknownError } from '~/core/errors';
import { getMQTTClientId } from '~/core/device';

const QOS_FAILURE_CODE = 128;

const RETRY_BASE_TIMEOUT = 1000;
const RETRY_MAX_TIMEOUT = 8000;

const enum MqttError {
  IDENTIFIER_REJECTED = 2,
  BAD_USERNAME_OR_PASSWORD = 134,
  NOT_AUTHORIZED = 135,
}

export function getMqttOptions(params: {
  username: string;
  password: string;
  clientId?: string;
}): IClientOptions {
  return {
    clean: false, // keep subscriptions
    clientId: `mqttjs_ + ${Math.random().toString(16).substring(2, 10)}`,
    protocolId: 'MQTT',
    protocolVersion: 4,
    reconnectPeriod: RETRY_BASE_TIMEOUT,
    will: {
      topic: 'WillMsg',
      payload: 'Connection Closed abnormally..!',
      qos: 0,
      retain: false,
    },
    resubscribe: true,

    ...params,
  };
}

/**
 * Creates a pre-configured socket.io instance
 *
 * @param endpoint The mqtt server's URL
 * @returns A pre-configured (non-connected) mqtt client instance
 *
 * @category Transport
 * @hidden
 */
export const createMqttTransport = (endpoint: string): Amity.MqttClient => {
  let mqttClient: MqttClient;

  async function connect(params: { accessToken: string; userId: string }): Promise<void> {
    const clientId = await getMQTTClientId(params.userId);

    if (mqttClient) {
      mqttClient.removeAllListeners();
      mqttClient.end(true);
    }

    mqttClient = mqtt.connect(
      endpoint,
      getMqttOptions({
        username: params.userId,
        password: params.accessToken,
        clientId,
      }),
    );

    mqttClient.on('connect', () => {
      mqttClient.options.reconnectPeriod = RETRY_BASE_TIMEOUT;

      subscribeGlobalTopic();
    });

    mqttClient.on('error', (error: Error & { code: number }) => {
      // eslint-disable-next-line default-case
      switch (error.code) {
        case MqttError.IDENTIFIER_REJECTED:
        case MqttError.BAD_USERNAME_OR_PASSWORD:
        case MqttError.NOT_AUTHORIZED:
          mqttClient.end();
      }
    });

    mqttClient.on('reconnect', () => {
      // Double the reconnect period for each attempt
      mqttClient.options.reconnectPeriod = Math.min(
        (mqttClient.options.reconnectPeriod || RETRY_BASE_TIMEOUT) * 2,
        RETRY_MAX_TIMEOUT,
      );
    });

    return new Promise(resolve => mqttClient!.once('connect', () => resolve()));
  }

  return {
    connect,
    async disconnect(): Promise<void> {
      if (this.connected) {
        return new Promise(resolve => mqttClient?.end(true, undefined, () => resolve()));
      }
    },
    get connected() {
      return !!mqttClient?.connected;
    },
    on<T extends keyof Amity.MqttEvents>(
      event: T,
      handler: (payload: Amity.MqttEvents[T]) => void,
    ) {
      mqttClient?.on(event, handler);
    },
    once<T extends keyof Amity.MqttEvents>(
      event: T,
      handler: (payload: Amity.MqttEvents[T]) => void,
    ) {
      mqttClient?.once(event, handler);
    },
    off<T extends keyof Amity.MqttEvents>(
      event: T,
      handler?: (payload: Amity.MqttEvents[T]) => void,
    ) {
      if (handler !== undefined) {
        mqttClient?.off(event, handler);
      } else {
        mqttClient?.removeAllListeners(event);
      }
    },
    removeAllListeners() {
      mqttClient?.removeAllListeners();
    },
    subscribe(topic: string, callback?: Amity.Listener<ASCError | void>): Amity.Unsubscriber {
      const callbackWrapper = (error: Error, granted: ISubscriptionGrant[]) => {
        // In MQTT.js, when you subscribe to a topic with QoS 0, the granted parameter
        // in the callback will typically be empty or undefined
        if (error || granted[0]?.qos === QOS_FAILURE_CODE) {
          const ascError = error
            ? new ASCError(error.message, Amity.ClientError.UNKNOWN_ERROR, Amity.ErrorLevel.ERROR)
            : // TODO throw the actual error, once BE can tell us the actual error code
              new ASCUnknownError(Amity.ClientError.UNKNOWN_ERROR, Amity.ErrorLevel.ERROR);

          // Use warning lv instead of error lv to prevent misunderstanding of user
          console.warn(`Failed to subscribe to topic ${topic}`, ascError);
          callback?.(ascError);
        } else {
          console.log(`Subscribed to topic ${topic}`);
          callback?.();
        }
      };

      if (mqttClient) {
        mqttClient.subscribe(topic, { qos: 0 }, callbackWrapper);
      } else {
        callbackWrapper(new Error('No connection to broker'), []);
      }

      return () => mqttClient?.unsubscribe(topic);
    },
    unsubscribe(topic: string) {
      mqttClient?.unsubscribe(topic);
    },
  };
};
