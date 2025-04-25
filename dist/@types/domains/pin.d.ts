export {};
declare global {
    namespace Amity {
        type RawPin = {
            referenceId: string;
            referenceType: string;
            placement: string;
            pinnedBy: string;
            pinnedAt: Date;
        };
        type RawPinTarget = {
            targetId: string;
            targetType: string;
            lastPinsUpdatedAt: Date;
        };
        type InternalPin = RawPin;
        type InternalPinTarget = RawPinTarget;
        type Pin = InternalPin;
        type PinTarget = InternalPinTarget;
    }
}
//# sourceMappingURL=pin.d.ts.map