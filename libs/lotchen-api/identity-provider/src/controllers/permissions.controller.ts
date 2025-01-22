import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { PermissionAction } from '@lotchen/api/core';

@ApiHeader({
  name: 'x-tenant-fqn',
  description: 'The Tenant Fqn',
})
@Controller({
  version: '1',
  path: 'permissions',
})
@ApiTags('Permissions')
export class PermissionsController {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly connection: Connection
  ) {}

  @Post('/generate-permissions')
  async generatePermissions(@Body() req: any): Promise<any> {
    const permissions = Object.values(PermissionAction).map(
      (item) => item as string
    );

    await this.connection.dropCollection('identity_permissions');
    await this.connection.collection('identity_permissions').insertMany([
      ...permissions.map((permission) => {
        return {
          code: permission,
        };
      }),
    ]);
    return permissions;
  }
}
