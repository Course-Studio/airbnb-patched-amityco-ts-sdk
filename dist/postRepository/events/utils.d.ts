export declare const createPostEventSubscriber: (event: keyof Amity.MqttPostEvents, callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
export declare const createLocalPostEventSubscriber: (event: keyof Omit<Amity.LocalPostEvents, "local.post.addReaction" | "local.post.removeReaction">, callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
