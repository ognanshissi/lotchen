import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationRequest {
  @ApiProperty({ required: false })
  public sort?: Record<string, 'asc' | 'desc'>;

  @ApiProperty({
    description: 'Page Index',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  public pageIndex!: number;

  @ApiProperty({ type: Number, maximum: 30, minimum: 5, example: 5 })
  @IsNumber()
  @Max(30)
  @Min(5)
  public pageSize!: number;
}

export interface PagingFilter {
  fieldName: string;
  operator: 'eq' | 'lt' | 'gte' | 'lte' | 'gt' | 'in' | 'nin' | 'ne';
  value: string | string[] | boolean;
}

export type logicalOperator = 'and' | 'or' | 'not' | 'nor';
