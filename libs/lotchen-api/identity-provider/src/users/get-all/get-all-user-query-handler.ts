import { RequestHandler } from '@lotchen/api/core';
import { GetAllUserQuery } from './get-all-user-query';
import { Inject, Injectable } from '@nestjs/common';
import { UserDocument } from '../user.schema';
import { Model } from 'mongoose';
import { ProfileDocument } from '../../profile';

@Injectable()
export class GetAllUserQueryHandler
  implements RequestHandler<null, GetAllUserQuery[]>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
    @Inject('PROFILE_MODEL')
    private readonly profileModel: Model<ProfileDocument>
  ) {}

  public async handlerAsync(): Promise<GetAllUserQuery[]> {
    const profiles = await this.profileModel
      .find({}, 'contactInfo firstName lastName createdAt updatedAt user')
      .populate('user', '_id')
      .lean()
      .exec();

    return profiles.map((item) => {
      return {
        userId: item.user._id,
        email: item.contactInfo.email,
        firstName: item.firstName,
        lastName: item.lastName,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as GetAllUserQuery;
    });
  }
}
