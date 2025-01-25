import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Territory } from '../schemas/territory.schema';

@Injectable()
export class TerritoriesService {
  constructor(
    @Inject('TERRITORY_MODEL') private readonly TerritoryModel: Model<Territory>
  ) {}

  async createAsync(payload: {
    name: string;
    coordinates?: [number];
  }): Promise<void> {
    const territory = new this.TerritoryModel({
      name: payload.name,
      location: {
        type: 'Point',
        coordinates: payload?.coordinates,
      },
    });

    const errors = territory.validateSync();

    if (errors) {
      throw new BadRequestException(errors.errors);
    }

    await territory.save();
  }
}
