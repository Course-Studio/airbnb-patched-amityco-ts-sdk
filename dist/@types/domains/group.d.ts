export {};
declare global {
    namespace Amity {
        enum GroupTypeEnum {
            CHANNEL = "channel",
            COMMUNITY = "community"
        }
        type GroupType = `${GroupTypeEnum}`;
        type GroupMembership = 'member' | 'none' | 'banned' | 'muted';
        type Group = {
            membersCount: number;
        };
        type Member<T extends Amity.GroupType> = {
            userId: Amity.InternalUser['userId'];
        } & (T extends 'channel' ? {
            channelId: Amity.Channel['channelId'];
            membership: GroupMembership;
            readToSegment: number;
            lastMentionedSegment: number;
        } : T extends 'community' ? {
            communityId: Amity.Community['communityId'];
            communityMembership: GroupMembership;
        } : never) & Amity.Timestamps;
        type MemberWithUser<T extends Amity.GroupType> = Member<T> & {
            readonly user?: Amity.InternalUser;
        };
        type RawMembership<T extends Amity.GroupType> = {
            isBanned: boolean;
            isMuted: boolean;
            muteTimeout: string;
            lastActivity: Amity.timestamp;
        } & Amity.Member<T> & Amity.Accredited;
        type Membership<T extends Amity.GroupType> = Amity.RawMembership<T> & {
            readonly user?: Amity.InternalUser;
        };
    }
}
