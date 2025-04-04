import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'meetings',
  version: '1',
})
@ApiTags('Meetings')
export class MeetingsController {}
