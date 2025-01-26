import { AggregateRoot } from './schemas/auditable.schema';
import {
  HydratedDocument,
  Model,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
} from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseRepository<TEntity extends AggregateRoot> {
  constructor(protected _entityModel: Model<TEntity>) {}

  async findAllAsync(
    filter: RootFilterQuery<TEntity>,
    projection?: ProjectionType<TEntity> | null | undefined,
    options?: QueryOptions<TEntity> | null | undefined
  ): Promise<Array<HydratedDocument<TEntity>>> {
    return await this._entityModel
      .find({ ...filter, isDeleted: false }, projection, options)
      .exec();
  }

  // async findByIdAsync(id: string): Promise<HydratedDocument<TEntity>> {
  //   return await this._entityModel.findById(id).exec();
  // }
  //
  // async findOneAsync(
  //   filter: RootFilterQuery<TEntity>,
  //   projection?: ProjectionType<TEntity> | null | undefined
  // ): Promise<HydratedDocument<TEntity>> {
  //   return await this._entityModel
  //     .findOne({ ...filter, isDeleted: false }, projection)
  //     .exec();
  // }

  async create(payload: Partial<TEntity>): Promise<HydratedDocument<TEntity>> {
    return await this._entityModel.create(payload);
  }
}
