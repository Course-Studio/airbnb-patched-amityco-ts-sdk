import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumCommentActions } from './enums';
export declare class CommentQueryStreamController extends QueryStreamController<Amity.CommentPayload, Amity.CommentLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.CommentLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.CommentPayload) => Amity.ProcessedCommentPayload);
    saveToMainDB(response: Amity.CommentPayload): Promise<void>;
    appendToQueryStream(response: Amity.CommentPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumCommentActions): (comment: Amity.InternalComment) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (comment: Amity.InternalComment) => void) => Amity.Unsubscriber;
        action: EnumCommentActions;
    }[]): Amity.Unsubscriber[];
}
//# sourceMappingURL=CommentQueryStreamController.d.ts.map