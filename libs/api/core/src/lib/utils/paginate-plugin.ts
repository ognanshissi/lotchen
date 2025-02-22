// import mongoose, { PopulateOptions } from 'mongoose';
// import * as paginatePlugin from 'mongoose-paginate-v2';
// import { PaginationRequest } from '../dto';
//
// export const WithPagination = function (schema: mongoose.Schema) {
//   return schema.plugin(paginatePlugin);
// };
//
// export const paginate = function <T, F>(
//   query: mongoose.QueryWithHelpers<Array<T>, T, mongoose.PaginateModel<T>>,
//   dto: PaginationRequest<F>,
//   populateOptions: PopulateOptions[] | [],
//   projection?: string
// ) {
//   return query.paginate({
//     page: dto.pageIndex,
//     limit: dto.pageSize,
//     populate: populateOptions,
//     projection,
//   });
// };
