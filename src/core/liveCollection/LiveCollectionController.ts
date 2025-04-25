import { convertGetterPropsToStatic, removeFunctionProperties } from '~/utils/object';
import { isEqual } from '~/utils/isEqual';
import { PaginationController } from './PaginationController';
import { PaginationNoPageController } from './PaginationNoPageController';

export abstract class LiveCollectionController<
  TPayloadDomain extends keyof Amity.Payloads,
  TQueryParams,
  TPublicPayload extends Record<string, unknown>,
  TPaginationController extends
    | PaginationController<TPayloadDomain, TQueryParams>
    | PaginationNoPageController<TPayloadDomain, TQueryParams>,
> {
  protected paginationController: TPaginationController;

  protected queryStreamId: string;

  protected cacheKey: string[];

  protected callback: Amity.LiveCollectionCallback<TPublicPayload>;

  protected snapshot: TPublicPayload[] | undefined;

  constructor(
    paginationController: TPaginationController,
    queryStreamId: string,
    cacheKey: string[],
    callback: Amity.LiveCollectionCallback<TPublicPayload>,
  ) {
    this.paginationController = paginationController;
    this.queryStreamId = queryStreamId;
    this.cacheKey = cacheKey;
    this.callback = callback;
  }

  private async refresh() {
    try {
      let result;

      if (this.paginationController instanceof PaginationNoPageController) {
        result = await this.paginationController.onFetch();
      } else {
        result = await this.paginationController.loadFirstPage();
      }
      if (!result) return;

      await this.persistModel(result);

      this.persistQueryStream({
        response: result,
        direction: Amity.LiveCollectionPageDirection.NEXT,
        refresh: true,
      });
      this.notifyChange({ origin: Amity.LiveDataOrigin.SERVER, loading: false });
    } catch (e) {
      this.notifyChange({ origin: Amity.LiveDataOrigin.SERVER, loading: false, error: e });
    }
  }

  protected loadPage({
    initial = false,
    direction = Amity.LiveCollectionPageDirection.NEXT,
  }: {
    initial?: boolean;
    direction?: Amity.LiveCollectionPageDirection;
  }) {
    this.setup();

    this.notifyChange({ origin: Amity.LiveDataOrigin.LOCAL, loading: true });

    if (initial) {
      this.refresh();
    } else if (direction === Amity.LiveCollectionPageDirection.PREV) {
      this.loadPrevPage();
    } else if (direction === Amity.LiveCollectionPageDirection.NEXT) {
      this.loadNextPage();
    }
  }

  protected abstract setup(): void;

  async loadNextPage() {
    try {
      if (this.paginationController instanceof PaginationNoPageController) return;

      const result = await this.paginationController.loadNextPage();
      if (!result) return;

      await this.persistModel(result);

      this.persistQueryStream({
        response: result,
        direction: Amity.LiveCollectionPageDirection.NEXT,
      });
      this.notifyChange({ origin: Amity.LiveDataOrigin.SERVER, loading: false });
    } catch (e) {
      this.notifyChange({ origin: Amity.LiveDataOrigin.SERVER, loading: false, error: e });
    }
  }

  async loadPrevPage() {
    try {
      if (this.paginationController instanceof PaginationNoPageController) return;

      const result = await this.paginationController.loadPreviousPage();
      if (!result) return;

      await this.persistModel(result);

      this.persistQueryStream({
        response: result,
        direction: Amity.LiveCollectionPageDirection.PREV,
      });
      this.notifyChange({ origin: Amity.LiveDataOrigin.SERVER, loading: false });
    } catch (e) {
      this.notifyChange({ origin: Amity.LiveDataOrigin.SERVER, loading: false, error: e });
    }
  }

  protected abstract persistModel(
    response: Amity.Payloads[TPayloadDomain] & Partial<Amity.Pagination>,
  ): Promise<void> | void;

  protected abstract persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<TPayloadDomain>): void;

  abstract startSubscription(): Amity.Unsubscriber[];

  abstract notifyChange(params: Amity.LiveCollectionNotifyParams): void;

  protected shouldNotify(data: TPublicPayload[]) {
    const newData = data.map(convertGetterPropsToStatic).map(removeFunctionProperties);
    if (isEqual(this.snapshot, newData)) return false;

    this.snapshot = newData as TPublicPayload[];
    return true;
  }

  public getCacheKey() {
    return this.cacheKey;
  }
}
