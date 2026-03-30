import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions, PermissionsAction } from '@lotchen/api/core';
import {
  CreateProductCommand,
  CreateProductCommandHandler,
  CreateProductCommandResponse,
} from './create/create-product.command';
import {
  FindAllProductsQuery,
  FindAllProductsQueryHandler,
  FindAllProductsQueryResponse,
} from './find-all/find-all-products.query';
import {
  FindProductByIdQueryHandler,
  FindProductByIdQueryResponse,
} from './find-by-id/find-product-by-id.query';
import { UpdateProductCommandHandler } from './update/update-product.command';
import { DeleteProductCommandHandler } from './delete/delete-product.command';
import { PromoteProductCommandHandler } from './promote/promote-product.command';
import { DemoteProductCommandHandler } from './demote/demote-product.command';

@Controller({ version: '1', path: 'products' })
@ApiHeader({ name: 'x-tenant-fqn', description: 'The Tenant Fqn' })
@ApiTags('Products')
export class ProductController {
  constructor(
    private readonly _createHandler: CreateProductCommandHandler,
    private readonly _findAllHandler: FindAllProductsQueryHandler,
    private readonly _findByIdHandler: FindProductByIdQueryHandler,
    private readonly _updateHandler: UpdateProductCommandHandler,
    private readonly _deleteHandler: DeleteProductCommandHandler,
    private readonly _promoteHandler: PromoteProductCommandHandler,
    private readonly _demoteHandler: DemoteProductCommandHandler
  ) {}

  @Post()
  // @Permissions(PermissionsAction.productManage)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateProductCommandResponse,
  })
  async create(
    @Body() payload: CreateProductCommand
  ): Promise<CreateProductCommandResponse> {
    return this._createHandler.handlerAsync(payload);
  }

  @Get()
  // @Permissions(PermissionsAction.productManage)
  @ApiResponse({ type: [FindAllProductsQueryResponse] })
  async findAll(
    @Query() query: FindAllProductsQuery
  ): Promise<FindAllProductsQueryResponse[]> {
    return this._findAllHandler.handlerAsync(query);
  }

  @Get(':id')
  // @Permissions(PermissionsAction.productManage)
  @ApiResponse({ type: FindProductByIdQueryResponse })
  async findById(
    @Param('id') id: string
  ): Promise<FindProductByIdQueryResponse> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  // @Permissions(PermissionsAction.productManage)
  async update(
    @Param('id') id: string,
    @Body() payload: Omit<CreateProductCommand, 'name' | 'type'>
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ ...payload, id });
  }

  @Delete(':id')
  // @Permissions(PermissionsAction.productManage)
  async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }

  @Patch(':id/promote')
  // @Permissions(PermissionsAction.productManage)
  async promote(@Param('id') id: string): Promise<void> {
    return this._promoteHandler.handlerAsync({ id });
  }

  @Patch(':id/demote')
  // @Permissions(PermissionsAction.productManage)
  async demote(@Param('id') id: string): Promise<void> {
    return this._demoteHandler.handlerAsync({ id });
  }
}
