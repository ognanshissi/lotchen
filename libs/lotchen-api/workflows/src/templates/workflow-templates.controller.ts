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
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateWorkflowTemplateCommand,
  CreateWorkflowTemplateCommandHandler,
} from './create/create-workflow-template.command';
import {
  UpdateWorkflowTemplateCommandRequest,
  UpdateWorkflowTemplateCommandHandler,
} from './update/update-workflow-template.command';
import {
  FindWorkflowTemplateByIdQueryHandler,
  FindWorkflowTemplateByIdQueryResponse,
} from './find-by-id/find-workflow-template-by-id.query';
import {
  FindAllWorkflowTemplatesQuery,
  FindAllWorkflowTemplatesQueryHandler,
} from './find-all/find-all-workflow-templates.query';
import { DeleteWorkflowTemplateCommandHandler } from './delete/delete-workflow-template.command';
import { ActivateWorkflowTemplateCommandHandler } from './activate/activate-workflow-template.command';
import { ArchiveWorkflowTemplateCommandHandler } from './archive/archive-workflow-template.command';
import { DuplicateWorkflowTemplateCommandHandler } from './duplicate/duplicate-workflow-template.command';

@Controller({ path: 'workflow-templates', version: '1' })
@ApiTags('Workflow Templates')
export class WorkflowTemplatesController {
  constructor(
    private readonly _createHandler: CreateWorkflowTemplateCommandHandler,
    private readonly _updateHandler: UpdateWorkflowTemplateCommandHandler,
    private readonly _findByIdHandler: FindWorkflowTemplateByIdQueryHandler,
    private readonly _findAllHandler: FindAllWorkflowTemplatesQueryHandler,
    private readonly _deleteHandler: DeleteWorkflowTemplateCommandHandler,
    private readonly _activateHandler: ActivateWorkflowTemplateCommandHandler,
    private readonly _archiveHandler: ArchiveWorkflowTemplateCommandHandler,
    private readonly _duplicateHandler: DuplicateWorkflowTemplateCommandHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() command: CreateWorkflowTemplateCommand
  ): Promise<any> {
    return this._createHandler.handlerAsync(command);
  }

  @Get()
  public async findAll(
    @Query() query: FindAllWorkflowTemplatesQuery
  ): Promise<any[]> {
    return this._findAllHandler.handlerAsync(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'FindWorkflow Template By',
    type: FindWorkflowTemplateByIdQueryResponse,
  })
  public async findById(
    @Param('id') id: string
  ): Promise<FindWorkflowTemplateByIdQueryResponse> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async update(
    @Param('id') id: string,
    @Body() request: UpdateWorkflowTemplateCommandRequest
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async activate(@Param('id') id: string): Promise<void> {
    return this._activateHandler.handlerAsync({ id });
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async archive(@Param('id') id: string): Promise<void> {
    return this._archiveHandler.handlerAsync({ id });
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  public async duplicate(@Param('id') id: string): Promise<any> {
    return this._duplicateHandler.handlerAsync({ id });
  }
}
