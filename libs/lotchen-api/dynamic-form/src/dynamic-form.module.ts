import { Module } from '@nestjs/common';
import { FormsProvider } from './forms';

@Module({
  controllers: [],
  providers: [FormsProvider],
  exports: [FormsProvider],
})
export class DynamicFormModule {}
