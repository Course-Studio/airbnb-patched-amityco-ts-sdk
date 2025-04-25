export declare const onUserDeleted: (channelId: string) => (callback: (channel: Amity.StaticInternalChannel, member: Amity.Membership<'channel'>) => void) => Amity.Unsubscriber;
