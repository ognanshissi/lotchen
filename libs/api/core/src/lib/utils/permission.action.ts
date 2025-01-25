export enum PermissionAction {
  // user action
  userCreate = 'user_create',
  userDelete = 'user_delete',
  userRead = 'user_read',
  userList = 'user_list',
  userUpdate = 'user_update',
  userDeleteBulk = 'user_delete_bulk',
  userCreateAdmin = 'user_create_admin',
  userDeleteAdmin = 'user_delete_admin',
  userManage = 'user_manage',

  // roles
  roleCreate = 'role_create',
  roleDelete = 'role_delete',
  roleList = 'role_list',
  roleUpdate = 'role_update',
  roleRead = 'role_read',

  // permissions
  permissionCreate = 'permission_create',
  permissionDelete = 'permission_delete',
  permissionList = 'permission_list',
  permissionUpdate = 'permission_update',
  permissionRead = 'permission_read',
}
