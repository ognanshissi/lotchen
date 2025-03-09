import { RequestHandler } from '@lotchen/api/core';
import {
  FindAllUserQuery,
  FindAllUserQueryResponse,
} from './find-all-user-query';
import { Inject, Injectable } from '@nestjs/common';
import { UserDocument } from '../user.schema';
import { Model } from 'mongoose';
import { ProfileDocument } from '../../profile';

@Injectable()
export class FindAllUserQueryHandler
  implements RequestHandler<FindAllUserQuery, FindAllUserQueryResponse[]>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
    @Inject('PROFILE_MODEL')
    private readonly profileModel: Model<ProfileDocument>
  ) {}

  public async handlerAsync(
    query: FindAllUserQuery
  ): Promise<FindAllUserQueryResponse[]> {
    // dynamic projection
    let projection =
      'contactInfo firstName lastName createdAt updatedAt user jobTitle createdByInfo';

    if (query.fields) {
      projection = query.fields.split(',').join(' ');
    }

    // queryFilter
    let queryFilter = {};

    if (query.email) {
      queryFilter = {
        ...queryFilter,
        'contactInfo.email': new RegExp(query.email, 'i'),
      };
    }

    if (query.fullName) {
      queryFilter = {
        ...queryFilter,
        $or: [
          { firstName: new RegExp(query.fullName, 'i') },
          { lastName: new RegExp(query.fullName, 'i') },
        ],
      };
    }

    const profiles = await this.profileModel
      .find(queryFilter, projection, {
        sort: { createdAt: -1 },
      })
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
              firstName: item.createdByInfo.firstName,
              lastName: item.createdByInfo.lastName,
            }
          : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as FindAllUserQueryResponse;
    });
  }
}
