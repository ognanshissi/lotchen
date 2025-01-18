export class PaginationRequest {
  public filters!: PagingFilter[];
  public sort?: Record<string, unknown>;
  public pageIndex!: number;
  public pageSize!: number;
}

export interface PagingFilter {
  code: string;
  operator: 'eq' | 'or' | 'lt' | 'gte' | 'lte' | 'gt';
  value: string;
}
