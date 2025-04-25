export declare function addPostSetting({ communities }: {
    communities: Amity.RawCommunity[];
}): Amity.Community[];
export declare const prepareCommunityPayload: (rawPayload: Amity.CommunityPayload) => Amity.ProcessedCommunityPayload;
export declare const prepareCommunityMembershipPayload: (rawPayload: Amity.CommunityMembershipPayload) => Amity.ProcessedCommunityMembershipPayload;
export declare const prepareCommunityRequest: <T extends {
    [k: string]: any;
    postSetting?: Amity.Community['postSetting'];
}>(params: T) => Omit<T, "postSetting" | "storySetting"> & {
    allowCommentInStory: any;
    needApprovalOnPostCreation: boolean;
    onlyAdminCanPost: boolean;
};
export declare const prepareSemanticSearchCommunityPayload: ({ searchResult, ...communityPayload }: Amity.SemanticSearchCommunityPayload) => Amity.ProcessedSemanticSearchCommunityPayload;
