import { Request } from 'express';

export interface CurrentUser {
  sub: string;
  username: string;
  firstName: string;
  lastName: string;
  permissions: string[];
  profileId: string;
}

export interface RequestExtendedWithUser extends Request {
  user: CurrentUser;
}
