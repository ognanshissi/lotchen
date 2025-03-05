export const USER_FORGOT_PASSWORD_EVENT = 'user.forgot-password';

export class ForgotPasswordEvent {
  constructor(public email: string, public token: string) {}
}
