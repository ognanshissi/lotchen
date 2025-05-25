import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import * as fs from 'fs-extra';
import { ContactProvider } from '../contact.provider';

export class ImportContactsExcelCommand {
  @ApiProperty({
    description: 'Excel file with contacts to import in the CRM',
  })
  excelFile!: string;
}

export class ImportContactsExcelCommandResponse {
  @ApiProperty({ description: 'Message' })
  message!: string;
}

@Injectable()
export class ImportContactsExcelCommandHandler
  implements
    CommandHandler<
      ImportContactsExcelCommand,
      ImportContactsExcelCommandResponse
    >
{
  constructor(private readonly contactProvider: ContactProvider) {}

  private readonly _logger = new Logger(ImportContactsExcelCommand.name);

  public async handlerAsync(
    command: ImportContactsExcelCommand
  ): Promise<ImportContactsExcelCommandResponse | BadRequestException> {
    try {
      const workbook = XLSX.readFile(command.excelFile as string);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const contacts: any[] = XLSX.utils.sheet_to_json(sheet);

      if (!contacts.length) {
        throw new BadRequestException('No contacts to import!');
      }

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
            createdBy: this.contactProvider.user().userId,
            createdByInfo: this.contactProvider.user(),
          };

          contactsModel.push(contactModel);
        } else {
          this._logger.log(
            `The record with "${contact['Email']}" already exist.`,
            JSON.stringify(contact)
          );
        }
      }

      // Save contacts - Maybe put this persistence into another endpoint
      // Ask user to verify data that are going to be imported from the excel file.
      const createdContacts =
        await this.contactProvider.ContactModel.insertMany(contactsModel);

      // Delete file after processing
      await fs.remove(command.excelFile as string);
      this._logger.log(createdContacts);

      // Response
      return {
        message: 'Contacts importés avec succès',
      } satisfies ImportContactsExcelCommandResponse;
    } catch (error) {
      this._logger.error(JSON.stringify(error));
      return new BadRequestException(
        "Une erreur survenue lors de l'import des contacts"
      );
    }
  }
}
