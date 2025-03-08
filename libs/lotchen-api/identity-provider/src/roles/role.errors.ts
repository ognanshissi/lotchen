export class RoleErrors {
  static ROLE_ALREADY_EXISTS(name: string) {
    return `Role with name ${name} already exists`;
  }

  static ROLE_NOT_FOUND = 'Role not found';

  static BUILT_IN_ROLE_CANNOT_BE_EDITED = 'Built-in role cannot be edited';
}
