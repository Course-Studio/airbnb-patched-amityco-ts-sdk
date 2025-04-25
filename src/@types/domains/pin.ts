export {};

declare global {
  namespace Amity {
    type RawPin = {
      referenceId: string; // postId
      referenceType: string; // post
      placement: string; // 'default' | 'announcement' | 'global'
      pinnedBy: string; // userId
      pinnedAt: Date;
    };

    type RawPinTarget = {
      targetId: string; // communityId | messageFeedId
      targetType: string; // community | messageFeed
      lastPinsUpdatedAt: Date;
    };

    type InternalPin = RawPin;

    type InternalPinTarget = RawPinTarget;

    type Pin = InternalPin;

    type PinTarget = InternalPinTarget;
  }
}
