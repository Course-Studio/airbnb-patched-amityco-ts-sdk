import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
export declare class PinnedPostQueryStreamController extends QueryStreamController<Amity.PinnedPostPayload, Amity.PinnedPostLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.PinnedPostLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.PinnedPostPayload) => Amity.ProcessedPostPayload);
    saveToMainDB(response: Amity.PinnedPostPayload): Promise<void>;
    appendToQueryStream(response: Amity.PinnedPostPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
}
