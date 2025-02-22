import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TerritoryDocument } from './territory.schema';

@Injectable()
export class TerritoriesProvider {
  constructor(
    @Inject('TERRITORY_MODEL')
    public readonly TerritoryModel: Model<TerritoryDocument>
  ) {}
}
