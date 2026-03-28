import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';
import { Environment } from '../../common/product.enums';

export class DemoteProductCommand {
  id!: string;
}

@Injectable()
export class DemoteProductCommandHandler
  implements CommandHandler<DemoteProductCommand, void>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(command: DemoteProductCommand): Promise<void> {
    const product = await this.productsProvider.ProductModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    if (product.environment === Environment.Sandbox) {
      throw new BadRequestException(
        'Le produit est déjà en environnement sandbox'
      );
    }

    product.environment = Environment.Sandbox;
    product.promotedAt = undefined as never;
    product.updatedBy = this.productsProvider.user().userId;
    product.updatedByInfo = this.productsProvider.user();
    await product.save();
  }
}
