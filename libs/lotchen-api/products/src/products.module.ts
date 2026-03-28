import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { productsProviders } from './products.provider';
import { ProductController, productHandlers } from './product';
import { PolicyController, policyHandlers } from './policy';

@Module({
  imports: [CoreModule],
  controllers: [ProductController, PolicyController],
  providers: [...productsProviders, ...productHandlers, ...policyHandlers],
})
export class ProductsModule {}
