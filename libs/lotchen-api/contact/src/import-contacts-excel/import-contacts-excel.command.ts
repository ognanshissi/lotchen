import { CommandHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from 'express';

export class ImportContactsExcelCommand {
  @ApiProperty({
    description: 'Excel file with contacts to import in the CRM',
    type: () => File,
  })
  excelFile!: File;
}

@Injectable()
export class ImportContactsExcelCommandHandler
  implements CommandHandler<ImportContactsExcelCommand, void>
{
  public async handlerAsync(
    command: ImportContactsExcelCommand,
    req?: Request
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
