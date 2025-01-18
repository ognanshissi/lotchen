import { Module } from '@nestjs/common';
import { IdentityProviderModule } from '@lotchen/api/identity-provider';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/lotchen'),
    IdentityProviderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
