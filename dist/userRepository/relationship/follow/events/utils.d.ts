export declare const createFollowEventSubscriber: (event: keyof Amity.MqttFollowEvents, callback: Amity.Listener<Amity.InternalFollowStatus>) => Amity.Unsubscriber;
export declare const createLocalFollowEventSubscriber: (event: keyof Amity.LocalFollowEvents, callback: Amity.Listener<Amity.InternalFollowStatus>) => Amity.Unsubscriber;
