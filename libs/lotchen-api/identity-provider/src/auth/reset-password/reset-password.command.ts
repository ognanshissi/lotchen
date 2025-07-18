import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User, UserExtension, UserToken } from '../../users';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

export class ResetPasswordCommand {
  @IsNotEmpty()
  @ApiProperty({ description: 'token passed in the url' })
  token!: string;

  @IsNotEmpty()
  @ApiProperty()
  oldPassword!: string;

  @IsNotEmpty()
  @ApiProperty()
  password!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  confirmPassword!: string;
}

export class ResetPasswordCommandResponse {
  @ApiProperty({
    description: 'Message to describe the completed action',
  })
  @IsString()
  message!: string;
}

@Injectable()
export class ResetPasswordCommandHandler
  implements CommandHandler<ResetPasswordCommand, ResetPasswordCommandResponse>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    private readonly _jwtService: JwtService,
    @Inject('USER_TOKEN_MODEL')
    private readonly userTokenModel: Model<UserToken>
  ) {}

  public async handlerAsync(
    command: ResetPasswordCommand
  ): Promise<ResetPasswordCommandResponse> {
    const { sub, username } = await this._jwtService.verifyAsync<{
      sub: string;
      type: string;
      username: string;
    }>(command.token, { secret: process.env['SECRET'] });

    const userToken = await this.userTokenModel.findOne({
      content: command.token,
      user: sub,
      revokedAt: null,
    });

    if (!userToken) {
      throw new BadRequestException("L'utilisateur n'existe pas !");
    }

    if (command.password !== command.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas !');
    }

    const user = await this.userModel
      .findOne({ email: username }, 'password email _id salt')
      .lean()
      .exec();

    if (!user) {
      throw new BadRequestException("L'utilisateur n'existe pas !");
    }

    if (
      !(await UserExtension.comparePassword(command.oldPassword, user.password))
    ) {
      throw new BadRequestException("L'ancien mot de passe est incorrecte !");
    }

    const { salt, encryptedPassword } =
      await UserExtension.generatePasswordHash(command.password);

    await this.userModel.findByIdAndUpdate(user._id, {
      password: encryptedPassword,
      salt,
    });

    // Update token used property
    await this.userTokenModel.findOneAndUpdate(
      { content: command.token },
      { revokedAt: new Date() }
    );

    return {
      message: 'Félicitations, votre mot de passe a été modifié.',
    } as ResetPasswordCommandResponse;
  }
}
