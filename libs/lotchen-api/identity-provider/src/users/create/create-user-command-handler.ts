import { RequestExtendedWithUser, RequestHandler } from '@lotchen/api/core';
import { CreateUserCommand } from './create-user-command';
import { User, UserExtension } from '../user.schema';
import { Connection, Model } from 'mongoose';
import { Profile } from '../../profile/profile.schema';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UsersErrors } from '../users-errors';

@Injectable()
export class CreateUserCommandHandler
  implements RequestHandler<CreateUserCommand, null>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('PROFILE_MODEL') private readonly profileModel: Model<Profile>,
    @Inject('TENANT_CONNECTION') private readonly connection: Connection,
    @Inject(REQUEST) private readonly request: RequestExtendedWithUser
  ) {}

  public async handlerAsync(request: CreateUserCommand): Promise<null> {
    if (request?.confirmPassword !== request?.password) {
      throw new BadRequestException("Passwords doesn't match");
    }

    // check unique email
    const userExist = await this.userModel
      .findOne({ email: request.email })
      .lean()
      .exec();

    if (userExist) {
      throw new BadRequestException(UsersErrors.UserAlreadyExist());
    }

    const { salt, encryptedPassword } =
      await UserExtension.generatePasswordHash(request.password);

    const session = await this.connection.startSession();

    session.startTransaction();

    // current user info
    const { firstName, lastName, username, sub } = this.request.user;

    const user = new this.userModel({
      email: request.email,
      password: encryptedPassword,
      salt: salt,
      createdBy: sub,
      createdByInfo: {
        userId: sub,
        firstName,
        lastName,
        email: username,
      },
    });

    const profile = new this.profileModel({
      user: user._id,
      firstName: request.firstName,
      lastName: request.lastName,
      dateOfBirth: request.dateOfBirth,
      contactInfo: {
        email: user.email,
        phoneNumbers: {
          mobileNumber: {
            isConfirmed: false,
            contact: request.mobileNumber,
            isPrimary: true,
          },
        },
      },
      createdBy: sub,
      createdByInfo: {
        userId: sub,
        firstName,
        lastName,
        email: username,
      },
    });

    await user.save();
    await profile.save();

    await session.commitTransaction();

    await session.endSession();

    return null;
  }
}
