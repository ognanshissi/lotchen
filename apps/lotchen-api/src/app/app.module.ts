import { Module } from '@nestjs/common';
import { IdentityProviderModule } from '@lotchen/api/identity-provider';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    IdentityProviderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
