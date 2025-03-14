import {
  MongooseModuleAsyncOptions,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const mongooseModuleAsyncOptions: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => {
    const uri = config.get<string>('MONGO_URI');
    return { uri } as MongooseModuleOptions;
  },
  inject: [ConfigService],
};
