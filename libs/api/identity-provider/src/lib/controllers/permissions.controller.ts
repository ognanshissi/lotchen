import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PermissionAction } from '../utils/permission.action';

@Controller({
  version: '1',
  path: 'permissions',
})
@ApiTags('Permissions')
export class PermissionsController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

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
