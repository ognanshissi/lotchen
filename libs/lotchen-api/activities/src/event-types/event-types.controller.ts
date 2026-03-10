import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateEventTypeCommand,
  CreateEventTypeCommandHandler,
} from './create/create-event-type.command';
import {
  FindAllEventTypesQueryHandler,
  FindAllEventTypesQueryResponse,
} from './find-all/find-all-event-types.query';
import {
  FindEventTypeByIdQueryHandler,
  FindEventTypeByIdQueryResponse,
} from './find-by-id/find-event-type-by-id.query';
import {
  UpdateEventTypeCommand,
  UpdateEventTypeCommandHandler,
} from './update/update-event-type.command';
import { DeleteEventTypeCommandHandler } from './delete/delete-event-type.command';
import { SeedEventTypesCommandHandler } from './seed/seed-event-types.command';

@Controller({
  path: 'event-types',
  version: '1',
})
@ApiTags('Event Types')
export class EventTypesController {
  constructor(
    private readonly _createHandler: CreateEventTypeCommandHandler,
    private readonly _findAllHandler: FindAllEventTypesQueryHandler,
    private readonly _findByIdHandler: FindEventTypeByIdQueryHandler,
    private readonly _updateHandler: UpdateEventTypeCommandHandler,
    private readonly _deleteHandler: DeleteEventTypeCommandHandler,
    private readonly _seedHandler: SeedEventTypesCommandHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create a new event type',
  })
  public async createEventType(
    @Body() command: CreateEventTypeCommand
  ): Promise<void> {
    return await this._createHandler.handlerAsync(command);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllEventTypesQueryResponse,
    isArray: true,
  })
  public async findAllEventTypes(): Promise<FindAllEventTypesQueryResponse[]> {
    return await this._findAllHandler.handlerAsync();
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: FindEventTypeByIdQueryResponse })
  public async findEventTypeById(
    @Param('id') id: string
  ): Promise<FindEventTypeByIdQueryResponse> {
    return await this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateEventType(
    @Param('id') id: string,
    @Body() command: UpdateEventTypeCommand
  ): Promise<void> {
    command.id = id;
    return await this._updateHandler.handlerAsync(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteEventType(@Param('id') id: string): Promise<void> {
    return await this._deleteHandler.handlerAsync({ id });
  }

  @Post('seed')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Seed default event types',
  })
  public async seedEventTypes(): Promise<void> {
    return await this._seedHandler.handlerAsync();
  }
}
