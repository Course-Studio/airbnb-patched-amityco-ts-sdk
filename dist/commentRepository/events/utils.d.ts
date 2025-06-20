export declare const createCommentEventSubscriber: (event: keyof Amity.MqttCommentEvents, callback: Amity.Listener<Amity.InternalComment>) => Amity.Unsubscriber;
export declare const createLocalCommentEventSubscriber: (event: keyof Omit<Amity.LocalCommentEvents, "local.comment.addReaction" | "local.comment.removeReaction">, callback: Amity.Listener<Amity.InternalComment>) => Amity.Unsubscriber;
