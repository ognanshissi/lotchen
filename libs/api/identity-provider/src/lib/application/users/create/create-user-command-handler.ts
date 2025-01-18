import { RequestHandler } from '@lotchen/api/core';
import { CreateUserCommand } from './create-user-command';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserExtention } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { Profile } from '../../../schemas/profile.schema';
import { Address } from '../../../schemas/address';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserCommandHandler
  implements RequestHandler<CreateUserCommand, null>
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>
  ) {}

  public async handlerAsync(request: CreateUserCommand): Promise<null> {
    if (request?.confirmPassword !== request?.password) {
      throw new BadRequestException("Passwords doesn't match");
    }

    // check unique email

    const { salt, encryptedPassword } =
      await UserExtention.generatePasswordHash(request.password);

    const user = new this.userModel({
      email: request.email,
      password: encryptedPassword,
      salt: salt,
    });

    const profile = new this.profileModel({
      user: user._id,
      firstName: 'Ambroise',
      lastName: 'Bazie',
      dateOfBirth: new Date('1992-11-21'),
      contactInfo: {
        email: user.email,
        phoneNumbers: {
          mobileNumber: {
            isConfirmed: false,
            contact: '07877446734',
            isPrimary: true,
          },
        },
        address: new Address(),
      },
    });
    await user.save();
    await profile.save();

    return null;
  }
}
