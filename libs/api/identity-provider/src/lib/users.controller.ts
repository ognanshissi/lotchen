import { Controller, Get, Post, Version } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { User, UserExtention } from './schemas/user.schema';
import { Connection, Model } from 'mongoose';
import { Profile } from './schemas/profile.schema';
import { Address } from './schemas/address';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private connection: Connection,
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>
  ) {}

  @Post()
  @Version('1')
  public async createUser() {
    const { salt, encryptedPassword } =
      await UserExtention.generatePasswordHash('password');

    const user = new this.userModel({
      email: 'bazieambroise+1@gmail.com',
      password: encryptedPassword,
      salt: salt,
    });

    const profile = new this.profileModel({
      user: user._id,
      firstName: 'Ambroise',
      lastName: 'Bazie',
      dateOfBirth: new Date('1992-11-21'),
      contactInfo: {
        email: '',
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
  }

  @Get()
  @Version('1')
  public async users() {
    // Logic to list users will go here
    return await this.profileModel
      .find({}, undefined, {
        populate: { path: 'identity_profiles', options: { strict: false } },
      })
      .exec();
  }
}
