import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import {
  Product,
  ProductDocument,
  ProductSchema,
} from './product/product.schema';
import { Policy, PolicyDocument, PolicySchema } from './policy/policy.schema';

export const PRODUCT_MODEL = 'PRODUCT_MODEL';
export const POLICY_MODEL = 'POLICY_MODEL';

@Injectable()
export class ProductsProvider extends CurrentUserProvider {
  constructor(
    @Inject(PRODUCT_MODEL)
    public readonly ProductModel: Model<ProductDocument>,
    @Inject(POLICY_MODEL)
    public readonly PolicyModel: Model<PolicyDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const productsProviders: Provider[] = [
  {
    provide: PRODUCT_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Product.name, ProductSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: POLICY_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Policy.name, PolicySchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  ProductsProvider,
];
