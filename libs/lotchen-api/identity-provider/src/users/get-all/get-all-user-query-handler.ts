import { RequestHandler } from '@lotchen/api/core';
import { GetAllUserQuery } from './get-all-user-query';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../user.schema';
import { Model } from 'mongoose';

@Injectable()
export class GetAllUserQueryHandler
  implements RequestHandler<null, GetAllUserQuery[]>
{
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<User>) {}

  public async handlerAsync(): Promise<GetAllUserQuery[]> {
    const data = await this.userModel.find({}, 'id email').lean().exec();

    return data.map((item) => {
      return { id: item._id, email: item.email } as GetAllUserQuery;
    });
  }
}
