import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@lotchen/api/core';
import { Model } from 'mongoose';
import { UserDocument } from '../user.schema';
import { ProfileDocument } from '../../profile';

export class InviteUserCommand {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'FirstName' })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'LastName' })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Job title' })
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ description: 'Work number', type: String })
  workNumber!: string;

  @ApiProperty({ description: 'Mobile number', type: String })
  mobileNumber!: string;

  @ApiProperty({
    description: 'The user will report to this person',
    type: String,
  })
  reportTo!: string;

  @ApiProperty({ description: 'The user role id' })
  role!: string;

  @ApiProperty({
    description: 'List of teams the user is linked',
    type: [String],
  })
  teams!: string[];
}

@Injectable()
export class InviteUserCommandHandler
  implements CommandHandler<InviteUserCommand, any>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
    @Inject('PROFILE_MODEL')
    private readonly profileModel: Model<ProfileDocument>
  ) {}

  public async handlerAsync(command: InviteUserCommand): Promise<any> {
    const existingUser = await this.userModel
      .findOne({ email: command.email })
      .lean()
      .exec();

    if (existingUser) {
      return new BadRequestException('User already exist !');
    }
  }
}
