import { filterByPropEquality, filterBySearchTerm, filterByStringComparePartially } from '..';

const searchTermCollection = [
  { userId: 'userId', user: { displayName: 'displayName' } as Amity.InternalUser },
  { userId: 'notSearched', user: { displayName: 'do-not-return' } as Amity.InternalUser },
];

describe('filtering:', () => {
  describe('> filterBySearchTerm', () => {
    test('it should return items that match userId', () => {
      expect(filterBySearchTerm(searchTermCollection, 'user')).toStrictEqual([
        searchTermCollection[0],
      ]);
    });

    test('it should ignore search term case', () => {
      expect(filterBySearchTerm(searchTermCollection, 'USER')).toStrictEqual([
        searchTermCollection[0],
      ]);
    });

    test('it should return items that match displayName', () => {
      expect(filterBySearchTerm(searchTermCollection, 'displ')).toStrictEqual([
        searchTermCollection[0],
      ]);
    });

    test('it should return empty collection when no items match', () => {
      expect(filterBySearchTerm(searchTermCollection, 'non-existent')).toStrictEqual([]);
    });
  });

  describe('> filterByPropEquality', () => {
    test('it should filter by prop equality', () => {
      const prop = 'prop';
      const collection = [{ [prop]: 'value' }];

      expect(filterByPropEquality(collection, prop, 'value')).toStrictEqual(collection);
      expect(filterByPropEquality(collection, prop, 'otherValue')).toStrictEqual([]);
    });
  });

  describe('string match partially', () => {
    const collection = [{ displayName: 'Test' }, { displayName: 'test' }, { displayName: 'admin' }];
    test('it should return 2 items which match with search string', () => {
      expect(filterByStringComparePartially(collection, 'displayName', 'te')).toStrictEqual([
        collection[0],
        collection[1],
      ]);
    });

    test('it should return 1 items which match with search string', () => {
      expect(filterByStringComparePartially(collection, 'displayName', 'admin')).toStrictEqual([
        collection[2],
      ]);
    });
  });
});
