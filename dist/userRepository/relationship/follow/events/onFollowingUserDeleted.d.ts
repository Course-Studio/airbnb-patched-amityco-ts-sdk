export declare const onFollowingUserDeleted: ({ userId }: {
    userId: string;
}) => (callback: Amity.Listener<Amity.InternalFollowStatus>) => Amity.Unsubscriber;
