import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';

export class DeleteProductCommand {
  id!: string;
}

@Injectable()
export class DeleteProductCommandHandler
  implements CommandHandler<DeleteProductCommand, void>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(command: DeleteProductCommand): Promise<void> {
    const product = await this.productsProvider.ProductModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    product.deletedAt = new Date();
    await product.save();
  }
}
