import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import {
  SalesPipeline,
  SalesPipelineDocument,
  SalesPipelineSchema,
} from './pipelines/pipeline.schema';
import { Deal, DealDocument, DealSchema } from './deals/deal.schema';

export const SALES_PIPELINE_MODEL = 'SALES_PIPELINE_MODEL';
export const DEAL_MODEL = 'DEAL_MODEL';

@Injectable()
export class PipelinesProvider extends CurrentUserProvider {
  constructor(
    @Inject(SALES_PIPELINE_MODEL)
    public readonly SalesPipelineModel: Model<SalesPipelineDocument>,
    @Inject(DEAL_MODEL)
    public readonly DealModel: Model<DealDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const pipelinesProviders: Provider[] = [
  {
    provide: SALES_PIPELINE_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(SalesPipeline.name, SalesPipelineSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: DEAL_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Deal.name, DealSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  PipelinesProvider,
];
