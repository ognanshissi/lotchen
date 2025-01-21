import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IdentityProviderModule } from '@lotchen/api/identity-provider';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { mongooseModuleAsyncOptions } from './mongoose-module-options';
import { CoreModule, TenantMiddleware } from '@lotchen/api/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 6000, limit: 10 }]),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', cache: true }),
    EventEmitterModule.forRoot(),
    IdentityProviderModule,
    CoreModule,
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
