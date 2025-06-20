import { IClientOptions } from 'mqtt/dist/mqtt';
export declare function getMqttOptions(params: {
    username: string;
    password: string;
    clientId?: string;
}): IClientOptions;
/**
 * Creates a pre-configured socket.io instance
 *
 * @param endpoint The mqtt server's URL
 * @returns A pre-configured (non-connected) mqtt client instance
 *
 * @category Transport
 * @hidden
 */
export declare const createMqttTransport: (endpoint: string) => Amity.MqttClient;
