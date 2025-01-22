import { PermissionAction } from './permission.action';

export const predefinedRoles = {
  Administrator: [
    PermissionAction.permissionCreate,
    PermissionAction.permissionDelete,
    PermissionAction.permissionList,
    PermissionAction.permissionRead,
    PermissionAction.permissionUpdate,
    PermissionAction.userCreate,
    PermissionAction.userCreateAdmin,
    PermissionAction.userDelete,
    PermissionAction.userRead,
    PermissionAction.userList,
  ],
};
