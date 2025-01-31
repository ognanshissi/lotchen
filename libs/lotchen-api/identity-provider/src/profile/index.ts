import { GetUserProfileQueryHandler } from './get-profile/get-user-profile.query';

export * from './profile.controller';
export * from './profile.schema';
export * from './get-profile/get-user-profile.query';
export const profileHandlers = [GetUserProfileQueryHandler];
