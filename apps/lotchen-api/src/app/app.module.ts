import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { mongooseModuleAsyncOptions } from './mongoose-module-options';
import { CoreModule, TenantMiddleware } from '@lotchen/api/core';
import { IdentityProviderModule } from '@lotchen/lotchen-api/identity-provider';
import { ContactModule } from '@lotchen/lotchen-api/contact';
import { ActivitiesModule } from '@lotchen/lotchen-api/activities';
import { WorkflowsModule } from '@lotchen/lotchen-api/workflows';
import { PipelinesModule } from '@lotchen/lotchen-api/pipelines';
import { CampaignsModule } from '@lotchen/lotchen-api/campaigns';
import { CallingModule } from '@lotchen/lotchen-api/calling';
import { ProductsModule } from '@lotchen/lotchen-api/products';
import { ClientsModule } from '@lotchen/lotchen-api/clients';
import { DynamicFormModule } from '@lotchen/lotchen-api/dynamic-form';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60, limit: 4 }]),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', cache: true }),
    EventEmitterModule.forRoot(),
    IdentityProviderModule,
    ContactModule,
    CoreModule,
    ActivitiesModule,
    WorkflowsModule,
    PipelinesModule,
    CampaignsModule,
    CallingModule,
    ProductsModule,
    ClientsModule,
    DynamicFormModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
