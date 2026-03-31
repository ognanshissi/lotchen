import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';

export class FindAllFormsQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  formClass?: string;
}

export class FindAllFormsQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() formClass!: string;
  @ApiProperty() name!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() fieldCount!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

@Injectable()
export class FindAllFormsQueryHandler
  implements QueryHandler<FindAllFormsQuery, FindAllFormsQueryResponse[]>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(
    query?: FindAllFormsQuery
  ): Promise<FindAllFormsQueryResponse[]> {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query?.formClass) filter['formClass'] = query.formClass;

    const forms = await this.formsProvider.FormModel.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return forms.map((f) => ({
      id: f._id,
      formClass: f.formClass,
      name: f.name,
      isActive: f.isActive,
      fieldCount: f.fields?.length ?? 0,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }
}
