/**
 * Attach user object to membership model
 * - If cache is not enabled, set user to undefined ({..., user: undefined})
 * - If user object is not found in cache, set user to undefined
 * ({..., user: undefined})
 * - If a user is found in the cache, it attaches the user from the cache
 * ({..., user: { userId, displayName,... }})
 *
 * @param member The membership model object
 * @returns The membership model object that is already mapped to user
 * @hidden
 */
export declare const convertRawMembershipToMembership: <T extends Amity.GroupType>(member: Amity.RawMembership<T>) => Amity.Membership<T>;
/**
 * Attach user object to membership model
 * - If cache is not enabled, set user to undefined ({..., user: undefined})
 * - If user object is not found in cache, set user to undefined
 * ({..., user: undefined})
 * - If a user is found in the cache, it attaches the user from the cache
 * ({..., user: { userId, displayName,... }})
 *
 * @param member The membership model object
 * @param userIdProp The user ID prop name of membership object
 * @param userProp The user prop name of destination object
 * @returns The membership model object that is already mapped to user
 * @hidden
 */
export declare const withUser: <M extends Record<any, any>, I extends keyof M = "userId", U extends string = "user">(member: M, userIdProp?: I, userProp?: U) => Record<U, Amity.InternalUser | undefined> & M;
/**
 * Mapping membership model with user object
 *
 * @param members The membership model objects
 * @param userIdProp The user ID prop name of membership object
 * @param userProp The user prop name of destination object
 * @returns The membership model objects that is already
 * mapped to users
 * @hidden
 */
export declare const withUsers: <M extends Record<any, any>[], I extends keyof M[number] = "userId", U extends string = "user">(members: M, userIdProp?: I, userProp?: U) => (Record<U, Amity.InternalUser | undefined> & M[number])[];
/**
 * Transform members prop in any payload with attached users members
 *
 * @param payload The payload contain members prop
 * @param memberProp A name of members prop
 * @param userIdProp The user ID prop name of membership object
 * @param userProp The user prop name of destination object
 * @returns The transforming payload
 * @hidden
 */
export declare const prepareMembershipPayload: <P extends Record<any, any>, M extends keyof P, I extends keyof P[M][number] = "userId", U extends string = "user">(payload: P, memberProp: M, userIdProp?: I, userProp?: U) => Omit<P, M> & Record<M, (Record<U, Amity.InternalUser | undefined> & P[M][number])[]>;
