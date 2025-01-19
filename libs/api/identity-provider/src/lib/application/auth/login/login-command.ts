import { ApiProperty } from '@nestjs/swagger';
import { RequestHandler } from '@lotchen/api/core';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserExtention } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class LoginCommand {
  @ApiProperty()
  email!: string;
  @ApiProperty()
  password!: string;
}

export class LoginCommandResponse {
  @ApiProperty()
  accessToken!: string;
  @ApiProperty()
  expiresIn!: number;
  @ApiProperty()
  refreshToken!: string;
}

@Injectable()
export class LoginCommandHandler
  implements RequestHandler<LoginCommand, LoginCommandResponse>
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly _jwtService: JwtService
  ) {}

  public async handlerAsync(
    request: LoginCommand
  ): Promise<LoginCommandResponse> {
    const userExist = await this.userModel
      .findOne({ email: request.email })
      .exec();

    if (!userExist) {
      throw new UnauthorizedException();
    }

    if (
      !(await UserExtention.comparePassword(
        request.password,
        userExist.password
      ))
    ) {
      throw new UnauthorizedException();
    }

    const payload = { sub: userExist.id, username: userExist.email };

    return {
      accessToken: await this._jwtService.signAsync(payload),
      refreshToken: await this._jwtService.signAsync({
        ...payload,
        type: 'refreshToken',
      }),
      expiresIn: 3600,
    } as LoginCommandResponse;
  }
}
