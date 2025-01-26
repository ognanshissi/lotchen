import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Agency } from '../../schemas/agency.schema';

@Injectable()
export class AgenciesProvider {
  constructor(
    @Inject('AGENCY_MODEL') public readonly AgencyModel: Model<Agency>
  ) {}
}
