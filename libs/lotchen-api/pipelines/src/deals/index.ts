export * from './create/create-deal.command';
export * from './update/update-deal.command';
export * from './find-by-id/find-deal-by-id.query';
export * from './find-all/find-all-deals.query';
export * from './delete/delete-deal.command';
export * from './move-stage/move-deal-stage.command';
export * from './win/win-deal.command';
export * from './lose/lose-deal.command';
export * from './reorder/reorder-deals.command';
export * from './deals.controller';
export * from './deal.schema';

import { CreateDealCommandHandler } from './create/create-deal.command';
import { UpdateDealCommandHandler } from './update/update-deal.command';
import { FindDealByIdQueryHandler } from './find-by-id/find-deal-by-id.query';
import { FindAllDealsQueryHandler } from './find-all/find-all-deals.query';
import { DeleteDealCommandHandler } from './delete/delete-deal.command';
import { MoveDealStageCommandHandler } from './move-stage/move-deal-stage.command';
import { WinDealCommandHandler } from './win/win-deal.command';
import { LoseDealCommandHandler } from './lose/lose-deal.command';
import { ReorderDealsCommandHandler } from './reorder/reorder-deals.command';

export const dealModuleHandlers = [
  CreateDealCommandHandler,
  UpdateDealCommandHandler,
  FindDealByIdQueryHandler,
  FindAllDealsQueryHandler,
  DeleteDealCommandHandler,
  MoveDealStageCommandHandler,
  WinDealCommandHandler,
  LoseDealCommandHandler,
  ReorderDealsCommandHandler,
];
