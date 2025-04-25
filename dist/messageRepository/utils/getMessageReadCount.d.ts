export declare const getMessageReadCount: (message: Amity.InternalMessage | Amity.RawMessage, marker?: Amity.MessageMarker) => Amity.MessageMarker | {
    readCount: number;
    deliveredCount: number;
};
