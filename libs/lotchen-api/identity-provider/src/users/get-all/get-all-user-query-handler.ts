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
      .find(
        {},
        'contactInfo firstName lastName createdAt updatedAt user jobTitle createdByInfo',
        {
          sort: { createdAt: -1 },
        }
      )
      .populate('user', '_id roles reportedTo teams')
      .lean()
      .exec();

    return profiles.map((item) => {
      return {
        userId: item.user._id,
        email: item.contactInfo.email,
        firstName: item.firstName,
        lastName: item.lastName,
        createdByInfo: item?.createdByInfo
          ? {
              id: item.createdByInfo.userId,
              email: item.createdByInfo.email,
              fullName: `${item.createdByInfo.firstName} ${item.createdByInfo.lastName}`,
            }
          : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as GetAllUserQuery;
    });
  }
}
