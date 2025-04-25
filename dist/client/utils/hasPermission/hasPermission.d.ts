export declare const hasPermission: (permission: string) => {
    currentUser: () => boolean;
    community: (communityId: Amity.Community['communityId']) => boolean;
    channel: (channelId: Amity.Channel['channelId']) => boolean;
};
//# sourceMappingURL=hasPermission.d.ts.map