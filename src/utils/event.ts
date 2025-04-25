import { pullFromCache } from '~/cache/api/pullFromCache';

export const convertEventPayload =
  <
    SourceModel extends Amity.Model,
    DestinationDomain extends Amity.Domain,
    DestinationModel extends Amity.Models[DestinationDomain],
  >(
    eventHandler: (callback: Amity.Listener<SourceModel>) => Amity.Unsubscriber,
    sourceModelProp: keyof SourceModel,
    destinationDomain: DestinationDomain,
  ) =>
  (callback: Amity.Listener<DestinationModel>) =>
    eventHandler(sourceModel => {
      if (!sourceModel) {
        return sourceModel;
      }

      const cacheKey = [destinationDomain, 'get', `${sourceModel[sourceModelProp]}`];
      const model = pullFromCache<DestinationModel>(cacheKey)?.data;

      if (!model) return;

      return callback(model);
    });
