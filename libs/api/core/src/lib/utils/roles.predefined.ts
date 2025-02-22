import { PermissionsAction } from './permission.action';

export const predefinedRoles: { [key: string]: string[] } = {
  Administrator: [
    PermissionsAction.roleCreate,
    PermissionsAction.roleList,
    PermissionsAction.roleRead,
    PermissionsAction.roleDelete,
    PermissionsAction.userCreate,
    PermissionsAction.userDelete,
    PermissionsAction.userManage,
    PermissionsAction.userCreateAdmin,
    PermissionsAction.userDeleteAdmin,
    PermissionsAction.territoryCreate,
    PermissionsAction.territoryUpdate,
    PermissionsAction.allRecordManage,
  ],
  Sale: [PermissionsAction.roleCreate],
  SalesManager: [PermissionsAction.roleCreate],
  Manager: [PermissionsAction.roleCreate],
  User: [PermissionsAction.roleCreate],
};
