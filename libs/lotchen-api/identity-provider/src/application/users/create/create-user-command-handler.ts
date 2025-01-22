import { RequestHandler } from '@lotchen/api/core';
import { CreateUserCommand } from './create-user-command';
import { User, UserExtension } from '../../../schemas/user.schema';
import { Connection, Model } from 'mongoose';
import { Profile } from '../../../schemas/profile.schema';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserCommandHandler
  implements RequestHandler<CreateUserCommand, null>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('PROFILE_MODEL') private readonly profileModel: Model<Profile>,
    @Inject('TENANT_CONNECTION') private readonly connection: Connection
  ) {}

  public async handlerAsync(request: CreateUserCommand): Promise<null> {
    if (request?.confirmPassword !== request?.password) {
      throw new BadRequestException("Passwords doesn't match");
    }

    // check unique email

    const { salt, encryptedPassword } =
      await UserExtension.generatePasswordHash(request.password);

    const session = await this.connection.startSession();

    session.startTransaction();

    const user = new this.userModel({
      email: request.email,
      password: encryptedPassword,
      salt: salt,
    });

    const profile = new this.profileModel({
      user: user._id,
      firstName: '',
      lastName: '',
      dateOfBirth: new Date('1992-11-21'),
      contactInfo: {
        email: user.email,
        phoneNumbers: {
          mobileNumber: {
            isConfirmed: false,
            contact: '07877446734',
            isPrimary: true,
          },
          workNumber: {
            isConfirmed: false,
            contact: '0777132974',
            isPrimary: false,
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
