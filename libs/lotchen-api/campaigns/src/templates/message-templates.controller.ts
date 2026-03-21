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
  CreateMessageTemplateCommand,
  CreateMessageTemplateCommandHandler,
} from './create/create-message-template.command';
import {
  UpdateMessageTemplateCommandRequest,
  UpdateMessageTemplateCommandHandler,
} from './update/update-message-template.command';
import { FindMessageTemplateByIdQueryHandler } from './find-by-id/find-message-template-by-id.query';
import { FindAllMessageTemplatesQueryHandler } from './find-all/find-all-message-templates.query';
import { DeleteMessageTemplateCommandHandler } from './delete/delete-message-template.command';
import { CampaignChannel } from '../common/campaign.enums';

@Controller({ path: 'message-templates', version: '1' })
@ApiTags('Message Templates')
export class MessageTemplatesController {
  constructor(
    private readonly _createHandler: CreateMessageTemplateCommandHandler,
    private readonly _updateHandler: UpdateMessageTemplateCommandHandler,
    private readonly _findByIdHandler: FindMessageTemplateByIdQueryHandler,
    private readonly _findAllHandler: FindAllMessageTemplatesQueryHandler,
    private readonly _deleteHandler: DeleteMessageTemplateCommandHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() command: CreateMessageTemplateCommand
  ): Promise<any> {
    return this._createHandler.handlerAsync(command);
  }

  @Get()
  public async findAll(
    @Query('channel') channel?: CampaignChannel,
    @Query('category') category?: string
  ): Promise<any[]> {
    return this._findAllHandler.handlerAsync({ channel, category });
  }

  @Get(':id')
  public async findById(@Param('id') id: string): Promise<any> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async update(
    @Param('id') id: string,
    @Body() request: UpdateMessageTemplateCommandRequest
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }
}
