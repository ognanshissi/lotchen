import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { FormsProvider } from '../..';

export class FindByClassNameQuery {
  @ApiProperty({
    description: 'The class name of the form to find',
    example: 'Contact',
  })
  className!: string;
}

export class FindByClassNameFieldDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  type!: string;
  @ApiProperty({ required: false, type: [String] })
  options?: string[];
  @ApiProperty()
  visible!: boolean;
  @ApiProperty({ description: 'Whether the field is required or not' })
  required!: boolean;
  @ApiProperty({ description: 'Whether the field is a custom field or not' })
  custom!: boolean;
  @ApiProperty({ description: 'The position of the field in the form' })
  position!: number;
  @ApiProperty({ description: 'The label of the field' })
  label!: string;
  @ApiProperty({ description: 'The placeholder of the field', required: false })
  placeholder?: string;
  @ApiProperty({ description: 'The hint of the field', required: false })
  hint?: string;
}

export class FindByClassNameQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  formClass!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    type: [FindByClassNameFieldDto],
    description: 'The fields of the form',
  })
  fields!: FindByClassNameFieldDto[];
}

@Injectable()
export class FindByClassNameQueryHandler
  implements QueryHandler<FindByClassNameQuery, FindByClassNameQueryResponse>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(
    query: FindByClassNameQuery
  ): Promise<FindByClassNameQueryResponse> {
    const form = await this.formsProvider.FormModel.findOne({
      formClass: query.className,
      deletedAt: null,
      isActive: true,
    })
      .lean()
      .exec();

    if (!form) {
      throw new Error(`Form with class name ${query.className} not found`);
    }

    return {
      id: form._id,
      formClass: form.formClass,
      name: form.name,
      fields: form.fields.map((f: any) => ({
        id: f._id,
        name: f.name,
        label: f.label,
        type: f.type,
        options: f.options,
        visible: f.visible,
        position: f.position,
        custom: f.custom,
        required: f.required,
      })),
    };
  }
}
