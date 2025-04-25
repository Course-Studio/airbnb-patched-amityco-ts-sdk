/**
 * Filter a given collection with strict equality against a param
 *
 * @param collection the collection to filter
 * @param key the key of the collection's items to challenge
 * @param value the expected value
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export declare const filterByPropEquality: <T = Record<string, unknown>>(collection: T[], key: keyof T, value: any) => T[];
export declare const filterByStringComparePartially: <T = Record<string, unknown>>(collection: T[], key: keyof T, value: any) => T[];
export declare const filterByPropInclusion: <T = Record<string, unknown>>(collection: T[], key: keyof T, value: any[] | undefined) => T[];
export declare const filterByPropIntersection: <T extends Record<string, unknown>>(collection: T[], key: keyof T, values: any[] | undefined) => T[];
/**
 * Filter a channel collection by membership of the userId
 *
 * @param collection the channel collection to filter
 * @param membership the membership to be filtered by
 * @param userId user id to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export declare const filterByChannelMembership: (collection: Amity.Channel[], membership: Amity.ChannelLiveCollection['membership'], userId: Amity.Membership<'channel'>['userId']) => Amity.Channel[];
/**
 * Filter a channel collection by membership of the userId
 *
 * @param collection the channel collection to filter
 * @param feedType to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export declare const filterByFeedType: <T extends Amity.InternalPost<any>>(collection: T[], feedType: Amity.Feed['feedType']) => T[];
/**
 * Filter a community collection by membership of the userId
 *
 * @param collection the community to filter
 * @param membership the membership to be filtered by
 * @param userId user id to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export declare const filterByCommunityMembership: <T extends Amity.Community>(collection: T[], membership: Amity.CommunityLiveCollection['membership'], userId: Amity.Membership<'community'>['userId']) => T[];
/**
 * Filter a post collection by dataType
 *
 * @param collection the post to filter
 * @param dataTypes of the post to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export declare const filterByPostDataTypes: <T extends Amity.InternalPost<any>>(collection: T[], dataTypes: Amity.PostLiveCollection['dataTypes']) => T[];
/**
 * Filter a collection by search term
 * Check if userId matches first if not filter by displayName
 *
 * @param collection to be filtered
 * @param searchTerm to filter collection by
 * @returns a filtered collection with items only matching the search term
 *
 * @hidden
 */
export declare const filterBySearchTerm: <T extends {
    userId: Amity.InternalUser['userId'];
    user?: Amity.InternalUser | undefined;
}>(collection: T[], searchTerm: string) => T[];
//# sourceMappingURL=filtering.d.ts.map