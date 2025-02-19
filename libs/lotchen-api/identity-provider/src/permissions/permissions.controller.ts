import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiHeader, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Connection, Model } from 'mongoose';
import { PermissionAction } from '@lotchen/api/core';
import { Permission } from './permission.schema';

export class FindAllPermissionQuery {
  @ApiProperty()
  code!: string;
}

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
    @Inject('TENANT_CONNECTION') private readonly connection: Connection,
    @Inject('PERMISSION_MODEL')
    private readonly permissionModel: Model<Permission>
  ) {}

  @Post('/generate')
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

  /**
   * Get all permissions
   */
  @Get('')
  @ApiResponse({
    type: [FindAllPermissionQuery],
  })
  async allPermissions(): Promise<FindAllPermissionQuery[]> {
    return this.permissionModel.find({}, 'code').lean().exec();
  }
}
