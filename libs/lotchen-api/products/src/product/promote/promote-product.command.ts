import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';
import { Environment, ProductStatus } from '../../common/product.enums';

export class PromoteProductCommand {
  id!: string;
}

@Injectable()
export class PromoteProductCommandHandler
  implements CommandHandler<PromoteProductCommand, void>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(command: PromoteProductCommand): Promise<void> {
    const product = await this.productsProvider.ProductModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    if (product.environment === Environment.Production) {
      throw new BadRequestException(
        'Le produit est déjà en environnement de production'
      );
    }

    if (!product.name) {
      throw new BadRequestException(
        'Le nom du produit est requis pour la promotion'
      );
    }

    if (product.testRunCount < 1) {
      throw new BadRequestException(
        'Le produit doit avoir au moins un test avant la promotion'
      );
    }

    product.environment = Environment.Production;
    product.status = ProductStatus.Active;
    product.promotedAt = new Date();
    product.promotedBy = this.productsProvider.user().userId;
    product.updatedBy = this.productsProvider.user().userId;
    product.updatedByInfo = this.productsProvider.user();
    await product.save();
  }
}
