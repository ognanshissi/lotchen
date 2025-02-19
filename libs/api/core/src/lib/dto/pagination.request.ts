import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FilterBase<T> {
  @ApiProperty({ description: 'Global Text search', type: String })
  globalText!: string;
  filters!: T;
}

export class PaginationRequest<TFilter> {
  @ApiProperty({ type: () => FilterBase<TFilter> })
  public filters!: FilterBase<TFilter>;
  @ApiProperty({ required: false })
  public sort?: Record<string, unknown>;
  @ApiProperty({
    description: 'Page Index',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  public pageIndex!: number;
  @ApiProperty({ type: Number, maximum: 30, minimum: 5, example: 5 })
  @IsNumber()
  public pageSize!: number;
}

export interface PagingFilter {
  fieldName: string;
  operator: 'eq' | 'lt' | 'gte' | 'lte' | 'gt' | 'in' | 'nin' | 'ne';
  value: string | string[] | boolean;
}

export type logicalOperator = 'and' | 'or' | 'not' | 'nor';
