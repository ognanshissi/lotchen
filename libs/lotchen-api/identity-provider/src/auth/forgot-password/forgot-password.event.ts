export const UserForgotPassword = 'user.forgot-password';

export class ForgotPasswordEvent {
  constructor(public email: string, public token: string) {}
}
