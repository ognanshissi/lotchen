import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { formsProviders, FormController, formHandlers } from './forms';

@Module({
  imports: [CoreModule],
  controllers: [FormController],
  providers: [...formsProviders, ...formHandlers],
})
export class DynamicFormModule {}
