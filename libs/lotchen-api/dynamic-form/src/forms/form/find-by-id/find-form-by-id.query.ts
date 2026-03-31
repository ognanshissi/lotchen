import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';
import { FieldType } from '../../field.schema';

export class FindFormByIdQuery {
  id!: string;
}

export class FieldResponse {
  @ApiProperty() _id!: string;
  @ApiProperty({ required: false }) parentId?: string | null;
  @ApiProperty() name!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ enum: FieldType }) type!: string;
  @ApiProperty() required!: boolean;
  @ApiProperty() visible!: boolean;
  @ApiProperty() custom!: boolean;
  @ApiProperty() position!: number;
  @ApiProperty({ required: false }) internal?: boolean;
  @ApiProperty({ required: false }) editable?: boolean;
  @ApiProperty({ required: false }) placeholder?: string;
  @ApiProperty({ required: false }) hint?: string;
  @ApiProperty({ required: false }) options?: string[];
}

export class FindFormByIdQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() formClass!: string;
  @ApiProperty() name!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ required: false }) metadata?: Record<string, string>;
  @ApiProperty({ type: [FieldResponse] }) fields!: FieldResponse[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

@Injectable()
export class FindFormByIdQueryHandler
  implements QueryHandler<FindFormByIdQuery, FindFormByIdQueryResponse>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(
    query: FindFormByIdQuery
  ): Promise<FindFormByIdQueryResponse> {
    const form = await this.formsProvider.FormModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!form) throw new NotFoundException('Formulaire introuvable');

    const sortedFields = [...(form.fields || [])].sort(
      (a, b) => a.position - b.position
    );

    return {
      id: form._id,
      formClass: form.formClass,
      name: form.name,
      isActive: form.isActive,
      metadata: form.metadata,
      fields: sortedFields.map((f) => ({
        _id: f._id,
        parentId: f.parentId,
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        visible: f.visible,
        custom: f.custom,
        position: f.position,
        internal: f.internal,
        editable: f.editable,
        placeholder: f.placeholder,
        hint: f.hint,
        options: f.options,
      })),
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }
}
