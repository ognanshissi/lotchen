import { Module } from '@nestjs/common';
import { activitiesProviders } from './activities.providet';

@Module({
  controllers: [],
  providers: [...activitiesProviders],
  exports: [],
})
export class ActivitiesModule {}
