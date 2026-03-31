import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';

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
  implements QueryHandler<void, FindAllFormsQueryResponse[]>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(): Promise<FindAllFormsQueryResponse[]> {
    const forms = await this.formsProvider.FormModel.find({ deletedAt: null })
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
