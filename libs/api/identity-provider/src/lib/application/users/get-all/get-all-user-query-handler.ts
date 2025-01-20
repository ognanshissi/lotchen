import { RequestHandler } from '@lotchen/api/core';
import { GetAllUserQuery } from './get-all-user-query';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class GetAllUserQueryHandler
  implements RequestHandler<null, GetAllUserQuery[]>
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  public async handlerAsync(): Promise<GetAllUserQuery[]> {
    const data = await this.userModel.find({}, 'id email').lean().exec();

    return data.map((item) => {
      return { id: item._id, email: item.email } as GetAllUserQuery;
    });
  }
}
