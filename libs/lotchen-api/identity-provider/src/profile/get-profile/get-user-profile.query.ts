import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '../profile.schema';
import { Model } from 'mongoose';

export class GetUserProfileQuery {
  @IsNotEmpty()
  @ApiProperty({ description: 'Current user id' })
  userId!: string;
}

export class ContactInfoDto {
  @ApiProperty()
  email!: string;
}

export class GetUserProfileQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ type: Date })
  dateOfBirth!: Date;

  @ApiProperty()
  defaultLanguage!: string;

  @ApiProperty({ type: ContactInfoDto })
  contactInfo!: ContactInfoDto;
}

@Injectable()
export class GetUserProfileQueryHandler
  implements QueryHandler<GetUserProfileQuery, GetUserProfileQueryResponse>
{
  constructor(
    @Inject('PROFILE_MODEL') private readonly profileModel: Model<Profile>
  ) {}

  public async handlerAsync(
    query: GetUserProfileQuery
  ): Promise<GetUserProfileQueryResponse> {
    const profile = await this.profileModel
      .findOne({ user: query.userId })
      .populate('user', 'id email')
      .exec();

    if (!profile) {
      throw new NotFoundException('Le profil est introuvable');
    }

    return {
      id: profile.id,
      userId: query.userId,
      dateOfBirth: profile.dateOfBirth,
      firstName: profile.firstName,
      lastName: profile.lastName,
      contactInfo: profile.contactInfo,
      defaultLanguage: profile.defaultLanguage,
    };
  }
}
