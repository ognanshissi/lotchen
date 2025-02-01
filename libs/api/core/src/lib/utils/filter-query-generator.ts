import { PagingFilter } from '../dto';

export const filterQueryGenerator = (filters: PagingFilter[]) => {
  const query: Record<string, any> = {};
  if (filters.length) {
    filters.map((filter) => {
      switch (filter.operator) {
        case 'eq':
          query[filter.fieldName] = filter.value;
          break;
        case 'gt':
          query[filter.fieldName] = { $gt: filter.value };
          break;
        case 'lt':
          query[filter.fieldName] = { $lt: filter.value };
          break;
        case 'ne':
          query[filter.fieldName] = { $ne: filter.value };
          break;
        case 'in':
          query[filter.fieldName] = { $in: filter.value };
          break;
        case 'lte':
          query[filter.fieldName] = { $lte: filter.value };
          break;
        default:
          console.log({ query });
      }
    });
  }
  return query;
};
