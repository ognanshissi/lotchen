import { ILocaleText } from '../interfaces';

export interface Permission {
  code: string;
  name: ILocaleText;
}

export interface PermissionGroup {
  title: ILocaleText;
  code: string;
  permissions: Permission[];
}

export enum PermissionsAction {
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
  userInvite = 'user_invite',

  territoryCreate = 'territory_create',
  territoryUpdate = 'territory_update',

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

  // super admin permission
  allRecordManage = 'all_records_manage',
}

export const permissionsActions: PermissionGroup[] = [
  {
    title: { fr: 'Statistiques', en: 'Analytics' },
    code: 'analytics',
    permissions: [
      {
        code: 'leads_stats',
        name: { fr: 'Statistiques des leads', en: 'Leads analytics' },
      },
    ],
  },
  {
    title: { fr: 'Utilisateurs', en: 'Users' },
    code: 'users',
    permissions: [
      {
        code: PermissionsAction.userCreate,
        name: { fr: 'Créer un utilisateur', en: 'Create user' },
      },
      {
        code: PermissionsAction.userUpdate,
        name: { fr: 'Modifier un utilisateur', en: 'Update user' },
      },
      {
        code: PermissionsAction.userInvite,
        name: { fr: 'Inviter un utilisateur', en: 'Invite user' },
      },
      {
        code: PermissionsAction.userDelete,
        name: { fr: 'Supprimer un utilisateur', en: 'Delete user' },
      },
      {
        code: PermissionsAction.userManage,
        name: { fr: 'Gere un utilisateur', en: 'Manage user' },
      },
    ],
  },
];
