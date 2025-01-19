import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User, UserExtention } from '../../../schemas/user.schema';
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
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly _jwtService: JwtService
  ) {}

  public async handlerAsync(
    command: ResetPasswordCommand
  ): Promise<ResetPasswordCommandResponse> {
    const { sub, username, type } = await this._jwtService.verifyAsync<{
      sub: string;
      type: string;
      username: string;
    }>(command.token, { secret: process.env['SECRET'] });

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
      !(await UserExtention.comparePassword(command.oldPassword, user.password))
    ) {
      throw new BadRequestException("L'ancien mot de passe est incorrecte !");
    }

    const { salt, encryptedPassword } =
      await UserExtention.generatePasswordHash(command.password);

    await this.userModel.findOneAndUpdate(
      { id: user._id },
      { password: encryptedPassword, salt }
    );

    return {
      message: 'Félicitations, votre mot de passe a été modifié.',
    } as ResetPasswordCommandResponse;
  }
}
