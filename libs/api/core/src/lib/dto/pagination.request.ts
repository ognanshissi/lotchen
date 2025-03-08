import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export enum Operator {
  eq = 'eq',
  lt = 'lt',
  gte = 'gte',
  lte = 'lte',
  gt = 'gt',
  in = 'in',
  nin = 'nin',
  ne = 'ne',
  Contain = 'contain',
}

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

export class FilterDto<TValue> {
  @ApiProperty({
    default: Operator.eq,
    enum: ['eq', 'lt', 'gte', 'lte', 'gt', 'in', 'nin', 'ne', 'contain'],
  })
  public operator!: Operator;
  @ApiProperty({ description: 'Value', type: String })
  public value!: TValue;
}

export type logicalOperator = 'and' | 'or' | 'not' | 'nor';
