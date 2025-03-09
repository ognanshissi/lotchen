export class UsersErrors {
  public static UserAlreadyExist() {
    return 'User already exist !';
  }

  public static SuperAdminAlreadyExist() {
    return 'Super Admin already exist, only one super admin is allowed';
  }
}
