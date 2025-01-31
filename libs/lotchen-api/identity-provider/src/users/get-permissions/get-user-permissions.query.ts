import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../user.schema';

export class GetUserPermissionsQuery {
  userId!: string;
}

export class GetUserPermissionsQueryResponse {
  @ApiProperty()
  code!: string;
}

@Injectable()
export class GetUserPermissionsQueryHandler
  implements
    QueryHandler<GetUserPermissionsQuery, GetUserPermissionsQueryResponse[]>
{
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<User>) {}

  public async handlerAsync(
    query: GetUserPermissionsQuery | undefined
  ): Promise<GetUserPermissionsQueryResponse[]> {
    const user = await this.userModel
      .findOne({ _id: query?.userId })
      .populate('permissions')
      .exec();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return (user.permissions ?? []).map((permission) => {
      return { code: permission.code } as GetUserPermissionsQueryResponse;
    });
  }
}
