import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { dispatchingProviders } from './dispatching.provider';
import { DispatchRulesController, dispatchRulesHandlers } from './rules';

@Module({
  imports: [CoreModule],
  controllers: [DispatchRulesController],
  providers: [...dispatchingProviders, ...dispatchRulesHandlers],
  exports: [],
})
export class DispatchingModule {}
