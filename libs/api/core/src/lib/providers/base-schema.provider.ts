import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { RequestExtendedWithUser } from '../interfaces';

@Injectable()
export class BaseSchemaProvider {
  public constructor(
    @Inject(REQUEST) public readonly request: RequestExtendedWithUser
  ) {}

  public currentUserInfo(): {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  } {
    // Update audit fields
    const { firstName, lastName, sub, username } = this.request.user;

    const userInfo = {
      userId: sub,
      email: username,
      firstName,
      lastName,
    };

    return { ...userInfo };
  }
}
