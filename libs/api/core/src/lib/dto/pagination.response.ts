import { ApiProperty } from '@nestjs/swagger';

export class Pagination<TData> {
  @ApiProperty({ description: '', type: Number })
  public totalElements!: number;
  @ApiProperty()
  public pageIndex!: number;
  @ApiProperty()
  public pageSize!: number;
  @ApiProperty()
  public totalPages!: number;
  @ApiProperty()
  public data!: TData[];
}
