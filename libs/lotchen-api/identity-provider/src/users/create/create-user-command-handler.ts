import { RequestHandler } from '@lotchen/api/core';
import { CreateUserCommand } from './create-user-command';
import { User, UserExtension } from '../user.schema';
import { Connection, Model } from 'mongoose';
import { Profile } from '../../profile/profile.schema';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UsersErrors } from '../users-errors';

@Injectable()
export class CreateUserCommandHandler
  implements RequestHandler<CreateUserCommand, null>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('PROFILE_MODEL') private readonly profileModel: Model<Profile>,
    @Inject('TENANT_CONNECTION') private readonly connection: Connection
  ) {}

  /**
   * Create only one superAdmin
   * @param request
   * @returns
   */
  public async handlerAsync(request: CreateUserCommand): Promise<null> {
    // check if superAdmin already exist - only one superAdmin is allowed
    const superAdmin = await this.userModel
      .countDocuments({ isSuperAdmin: true })
      .lean()
      .exec();

    if (superAdmin) {
      throw new BadRequestException(UsersErrors.SuperAdminAlreadyExist());
    }

    // check if password and confirmPassword match
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

    const user = new this.userModel({
      email: request.email,
      password: encryptedPassword,
      salt: salt,
      isSuperAdmin: true,
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
    });

    await user.save();
    await profile.save();

    await session.commitTransaction();

    await session.endSession();

    return null;
  }
}
