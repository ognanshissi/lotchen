import { CreateProductCommandHandler } from './create/create-product.command';
import { FindAllProductsQueryHandler } from './find-all/find-all-products.query';
import { FindProductByIdQueryHandler } from './find-by-id/find-product-by-id.query';
import { UpdateProductCommandHandler } from './update/update-product.command';
import { DeleteProductCommandHandler } from './delete/delete-product.command';
import { PromoteProductCommandHandler } from './promote/promote-product.command';
import { DemoteProductCommandHandler } from './demote/demote-product.command';

export const productHandlers = [
  CreateProductCommandHandler,
  FindAllProductsQueryHandler,
  FindProductByIdQueryHandler,
  UpdateProductCommandHandler,
  DeleteProductCommandHandler,
  PromoteProductCommandHandler,
  DemoteProductCommandHandler,
];

export { ProductController } from './product.controller';
