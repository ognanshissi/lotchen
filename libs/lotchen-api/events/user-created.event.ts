export const USER_CREATED = 'user.created';

export class UserCreatedEvent {
  constructor(public userId: string, public email: string) {}
}
