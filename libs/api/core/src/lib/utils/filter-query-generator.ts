// export const filterQueryGenerator = (filters: PagingFilter[]) => {
//   const query: Record<string, any> = {};
//   if (filters.length) {
//     filters.map((filter) => {
//       switch (filter.operator) {
//         case 'eq':
//           query[filter.fieldName] = filter.value;
//           break;
//         case 'gt':
//           query[filter.fieldName] = { $gt: filter.value };
//           break;
//         case 'lt':
//           query[filter.fieldName] = { $lt: filter.value };
//           break;
//         case 'ne':
//           query[filter.fieldName] = { $ne: filter.value };
//           break;
//         case 'in':
//           query[filter.fieldName] = { $in: filter.value };
//           break;
//         case 'lte':
//           query[filter.fieldName] = { $lte: filter.value };
//           break;
//         default:
//           console.log({ query });
//       }
//     });
//   }
//   return query;
// };

import { FilterDto } from '../dto';

export const filterQueryGenerator = (filter: FilterDto<any>) => {
  let query: { [key: string]: any } | string = {};

  switch (filter.operator) {
    case 'eq':
      query = { $eq: new RegExp(filter.value, 'i') };
      break;
    case 'lt':
      query = { $lt: filter.value };
      break;
    case 'lte':
      query = { $lte: filter.value };
      break;
    case 'gt':
      query = { $gt: filter.value };
      break;
    case 'gte':
      query = { $gte: filter.value };
      break;
    case 'contain':
      query = new RegExp(filter.value, 'i');
      break;
    default:
      query = new RegExp(filter.value, 'i');
  }

  return query;
};
