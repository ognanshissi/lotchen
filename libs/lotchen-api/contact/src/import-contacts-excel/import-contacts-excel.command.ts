import { CommandHandler, RequestExtendedWithUser } from '@lotchen/api/core';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from 'express';
import * as XLSX from 'xlsx';
import * as fs from 'fs-extra';
import { ContactProvider } from '../contact.provider';
import { REQUEST } from '@nestjs/core';

export class ImportContactsExcelCommand {
  @ApiProperty({
    description: 'Excel file with contacts to import in the CRM',
  })
  excelFile!: string;
}

@Injectable()
export class ImportContactsExcelCommandHandler
  implements CommandHandler<ImportContactsExcelCommand, any>
{
  constructor(
    private readonly contactProvider: ContactProvider,
    @Inject(REQUEST) private readonly _request: RequestExtendedWithUser
  ) {}

  public async handlerAsync(
    command: ImportContactsExcelCommand,
    req?: Request
  ): Promise<any> {
    const workbook = XLSX.readFile(command.excelFile as string);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const contacts: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!contacts.length) {
      throw new BadRequestException('No contacts to import!');
    }

    const { firstName, lastName, username, sub } = this._request.user;
    const createdBy = sub;
    const createdByInfo = {
      email: username,
      userId: sub,
      firstName,
      lastName,
    };

    // prepare conctact entity model

    const contactsModel = [];
    for (const contact of contacts) {
      // clean duplicated records
      const existingContact = await this.contactProvider.ContactModel.findOne(
        {
          $or: [
            {
              mobileNumber: contact['Mobile'],
            },
            {
              email: contact['Email'],
            },
          ],
        },
        'id'
      )
        .lean()
        .exec();

      if (!existingContact) {
        const contactModel = {
          firstName: contact['First name'],
          lastName: contact['Last name'],
          mobileNumber: contact['Mobile'], // mobile number
          jobTitle: contact['Job title'],
          email: contact['Email'],
          createdBy,
          createdByInfo,
        };

        contactsModel.push(contactModel);
      } else {
        console.log(`Duplicated record: `, contact);
      }
    }

    // Save contacts
    const createdContacts = await this.contactProvider.ContactModel.insertMany(
      contactsModel
    );

    // Delete file after processing
    await fs.remove(command.excelFile as string);

    return createdContacts;
  }
}
