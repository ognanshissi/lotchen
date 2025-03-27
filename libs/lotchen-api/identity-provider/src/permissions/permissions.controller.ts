import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiHeader, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Connection, Model } from 'mongoose';
import { PermissionsAction } from '@lotchen/api/core';
import { Permission } from './permission.schema';

export class FindAllPermissionQuery {
  @ApiProperty()
  code!: string;
}

@ApiHeader({
  name: 'x-tenant-fqdn',
  description: 'The Tenant Fqdn',
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
  @ApiResponse({
    type: [String],
  })
  async generatePermissions(): Promise<string[]> {
    const permissionCodes = Object.values(PermissionsAction).map(
      (item) => item as string
    );

    await this.permissionModel.db.dropCollection('identity_permissions');
    await this.connection.collection('identity_permissions').insertMany([
      ...permissionCodes.map((code: string) => {
        return {
          code,
        };
      }),
    ]);
    return permissionCodes;
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
