import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { mongooseModuleAsyncOptions } from './mongoose-module-options';
import { CoreModule, TenantMiddleware } from '@lotchen/api/core';
import { IdentityProviderModule } from '@lotchen/lotchen-api/identity-provider';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 6000, limit: 10 }]),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', cache: true }),
    EventEmitterModule.forRoot(),
    IdentityProviderModule,
    CoreModule,
    RouterModule.register([
      {
        path: 'identity',
        module: IdentityProviderModule,
      },
    ]),
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
