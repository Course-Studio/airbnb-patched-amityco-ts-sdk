import hash from 'object-hash';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { LinkedObject } from '~/utils/linkedObject';
import { filterByPropEquality, sortByFirstCreated, sortByLastCreated } from '~/core/query';
import {
  onStreamFlagged,
  onStreamRecorded,
  onStreamStarted,
  onStreamStopped,
  onStreamTerminated,
} from '~/streamRepository/events';
import { GetStreamsPageController } from '~/streamRepository/observers/getStreams/GetStreamsPageController';
import { GetStreamsQueryStreamController } from '~/streamRepository/observers/getStreams/GetStreamsQueryStreamController';

export class GetStreamsLiveCollectionController extends LiveCollectionController<
  'stream',
  Amity.StreamLiveCollection,
  Amity.Stream,
  GetStreamsPageController
> {
  private queryStreamController: GetStreamsQueryStreamController;

  private query: Amity.StreamLiveCollection;

  constructor(
    query: Amity.StreamLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Stream>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['streams', 'collection', queryStreamId];
    const paginationController = new GetStreamsPageController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;

    this.queryStreamController = new GetStreamsQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      paginationController,
    );

    this.paginationController = paginationController;
    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.StreamLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    let data = collection.data
      .map(streamId => pullFromCache<Amity.InternalStream>(['stream', 'get', streamId])!)
      .filter(Boolean)
      .map(stream => LinkedObject.stream(stream.data));

    if (!this.shouldNotify(data) && origin === 'event') return;

    data = this.applyFilter(data);

    this.callback({
      onNextPage: () =>
        this.loadPage({ initial: false, direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onStreamRecorded, action: 'onStreamRecorded' },
      { fn: onStreamStarted, action: 'onStreamStarted' },
      { fn: onStreamStopped, action: 'onStreamStopped' },
      { fn: onStreamFlagged, action: 'onStreamFlagged' },
      { fn: onStreamTerminated, action: 'onStreamTerminated' },
    ]);
  }

  protected setup() {
    const collection = pullFromCache<Amity.StreamLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected persistModel(response: Amity.StreamPayload) {
    this.queryStreamController.saveToMainDB(response);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'stream'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  private applyFilter = (data: Amity.InternalStream[]): Amity.InternalStream[] => {
    let streams = filterByPropEquality(data, 'isDeleted', this.query.isDeleted);

    streams = streams.sort(
      this.query.sortBy === 'lastCreated' ? sortByLastCreated : sortByFirstCreated,
    );

    return streams;
  };
}
