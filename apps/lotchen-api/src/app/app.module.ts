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
import { CallerController } from './caller.controller';
import { ActivitiesModule } from '@lotchen/lotchen-api/activities';

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
  ],
  controllers: [CallerController],
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
