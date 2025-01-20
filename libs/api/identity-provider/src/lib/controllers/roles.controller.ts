import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: 'roles',
})
@ApiTags('Roles')
export class RolesController {}
