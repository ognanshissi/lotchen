import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateDealCommand,
  CreateDealCommandHandler,
} from './create/create-deal.command';
import {
  UpdateDealCommandRequest,
  UpdateDealCommandHandler,
} from './update/update-deal.command';
import { FindDealByIdQueryHandler } from './find-by-id/find-deal-by-id.query';
import {
  FindAllDealsQuery,
  FindAllDealsQueryHandler,
} from './find-all/find-all-deals.query';
import { DeleteDealCommandHandler } from './delete/delete-deal.command';
import {
  MoveDealStageCommandRequest,
  MoveDealStageCommandHandler,
} from './move-stage/move-deal-stage.command';
import { WinDealCommandHandler } from './win/win-deal.command';
import {
  LoseDealCommandRequest,
  LoseDealCommandHandler,
} from './lose/lose-deal.command';
import {
  ReorderDealsCommand,
  ReorderDealsCommandHandler,
} from './reorder/reorder-deals.command';

@Controller({ path: 'deals', version: '1' })
@ApiTags('Deals')
export class DealsController {
  constructor(
    private readonly _createHandler: CreateDealCommandHandler,
    private readonly _updateHandler: UpdateDealCommandHandler,
    private readonly _findByIdHandler: FindDealByIdQueryHandler,
    private readonly _findAllHandler: FindAllDealsQueryHandler,
    private readonly _deleteHandler: DeleteDealCommandHandler,
    private readonly _moveStageHandler: MoveDealStageCommandHandler,
    private readonly _winHandler: WinDealCommandHandler,
    private readonly _loseHandler: LoseDealCommandHandler,
    private readonly _reorderHandler: ReorderDealsCommandHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() command: CreateDealCommand): Promise<any> {
    return this._createHandler.handlerAsync(command);
  }

  @Get()
  public async findAll(@Query() query: FindAllDealsQuery): Promise<any[]> {
    return this._findAllHandler.handlerAsync(query);
  }

  @Get(':id')
  public async findById(@Param('id') id: string): Promise<any> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async update(
    @Param('id') id: string,
    @Body() request: UpdateDealCommandRequest
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }

  @Patch(':id/move-stage')
  public async moveStage(
    @Param('id') id: string,
    @Body() request: MoveDealStageCommandRequest
  ): Promise<any> {
    return this._moveStageHandler.handlerAsync({ id, ...request });
  }

  @Patch(':id/win')
  public async win(@Param('id') id: string): Promise<any> {
    return this._winHandler.handlerAsync({ id });
  }

  @Patch(':id/lose')
  public async lose(
    @Param('id') id: string,
    @Body() request: LoseDealCommandRequest
  ): Promise<any> {
    return this._loseHandler.handlerAsync({ id, ...request });
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async reorder(@Body() command: ReorderDealsCommand): Promise<void> {
    return this._reorderHandler.handlerAsync(command);
  }
}
