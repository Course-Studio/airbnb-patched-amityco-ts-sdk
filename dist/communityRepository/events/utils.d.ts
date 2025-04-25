export declare const createCommunityEventSubscriber: (event: keyof Amity.MqttCommunityEvents, callback: Amity.Listener<Amity.Community>) => Amity.Unsubscriber;
