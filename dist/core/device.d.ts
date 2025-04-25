/** @hidden */
export declare const getDeviceId: () => Promise<string>;
export declare const getMQTTClientId: (userId: Amity.InternalUser["userId"]) => Promise<string>;
/** @hidden */
export declare const getDeviceModel: () => string;
/** @hidden */
export declare const getDeviceInfo: () => Amity.Device["deviceInfo"];
