import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, RequestExtendedWithUser } from '@lotchen/api/core';
import { Model } from 'mongoose';
import { UserDocument, UserExtension } from '../user.schema';
import { ProfileDocument } from '../../profile';
import { UsersErrors } from '../users-errors';
import * as process from 'node:process';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Team } from '../../teams';
import { REQUEST } from '@nestjs/core';

export class InviteUserCommand {
  @ApiProperty({ description: 'User email', required: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'FirstName', required: true })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'LastName', required: true })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Job title', required: true })
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ description: 'Work number', type: String, required: false })
  @MinLength(10, { message: 'Le number should be at least 8 characters' })
  workNumber!: string;

  @ApiProperty({ description: 'Mobile number', type: String, required: false })
  @MinLength(10, { message: 'Le number should be at least 8 characters' })
  mobileNumber!: string;

  @ApiProperty({
    description: 'The user will report to this person, aka the user manager',
    type: String,
    required: false,
  })
  reportTo!: string;

  @ApiProperty({ description: 'User date of birth', required: false })
  dateOfBirth!: string;

  @ApiProperty({ description: 'The user role id', required: false })
  role!: string;

  @ApiProperty({
    description: 'List of teams ids the user belongs to',
    type: String,
    required: false,
  })
  teams!: string;
}

@Injectable()
export class InviteUserCommandHandler
  implements CommandHandler<InviteUserCommand, void>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
    @Inject('PROFILE_MODEL')
    private readonly profileModel: Model<ProfileDocument>,
    @Inject('TEAM_MODEL') private readonly TeamModel: Model<Team>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(REQUEST)
    private readonly request: RequestExtendedWithUser
  ) {}

  public async handlerAsync(command: InviteUserCommand): Promise<void> {
    const existingUser = await this.userModel
      .findOne({ email: command.email })
      .lean()
      .exec();

    if (existingUser) {
      throw new BadRequestException(UsersErrors.UserAlreadyExist());
    }

    // generate a default password for new user

    const longString = `qwertyuiopasdfghjklzxcvbnm!@#$%&*()1234567890`;

    const { createHmac } = await import('node:crypto');

    // Auto-generated password
    const secret = process.env['SECRET'] ?? longString;
    const hash = createHmac('sha256', secret)
      .update(`${command.firstName} ${command.lastName}`)
      .digest('hex');
    //

    const { salt, encryptedPassword } =
      await UserExtension.generatePasswordHash(hash);

    if (!command.teams) {
      throw new BadRequestException('User should belong to a team');
    }

    const team = await this.TeamModel.findOne({ _id: command.teams })
      .lean()
      .exec();

    // Need user team assignment history
    const { firstName, lastName, username, sub } = this.request.user;

    const user = new this.userModel({
      email: command.email,
      password: encryptedPassword,
      salt: salt,
      reportedTo: command.reportTo,
      teams: [team],
      roles: [command.role],
      createdBy: sub,
      createdByInfo: {
        firstName,
        lastName,
        email: username,
        userId: sub,
      },
    });

    const profile = new this.profileModel({
      user: user._id,
      firstName: command.firstName,
      lastName: command.lastName,
      dateOfBirth: command.dateOfBirth ?? new Date(1992, 2, 23),
      jobTitle: command.jobTitle,
      contactInfo: {
        email: user.email,
        phoneNumbers: {
          mobileNumber: {
            isConfirmed: false,
            contact: command.mobileNumber,
            isPrimary: true,
          },
          workNumber: {
            isConfirmed: false,
            contact: command.workNumber,
            isPrimary: false,
          },
        },
      },
      createdBy: sub,
      createdByInfo: {
        firstName,
        lastName,
        email: username,
        userId: sub,
      },
    });

    await user.save();
    await profile.save();

    // return user._id;
    // this.eventEmitter.emit(USER_INVITED_EVENT, new InvitedUserEvent(user._id));
  }
}
