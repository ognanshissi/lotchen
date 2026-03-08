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

export class ImportContactsExcelErrorDetail {
  @ApiProperty({ description: 'Row number in the Excel file' })
  row!: number;

  @ApiProperty({ description: 'Reason for the error' })
  reason!: string;
}

export class ImportContactsExcelCommandResponse {
  @ApiProperty({ description: 'Number of contacts created' })
  createdCount!: number;

  @ApiProperty({ description: 'Number of contacts skipped (duplicates)' })
  skippedCount!: number;

  @ApiProperty({ description: 'Number of rows with errors' })
  errorCount!: number;

  @ApiProperty({
    description: 'Details of rows that had errors',
    type: [ImportContactsExcelErrorDetail],
  })
  errors!: ImportContactsExcelErrorDetail[];
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
  ): Promise<ImportContactsExcelCommandResponse> {
    try {
      const workbook = XLSX.readFile(command.excelFile as string);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const contacts: any[] = XLSX.utils.sheet_to_json(sheet);

      if (!contacts.length) {
        throw new BadRequestException('No contacts to import!');
      }

      const contactsModel = [];
      let skippedCount = 0;
      const errors: ImportContactsExcelErrorDetail[] = [];

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const rowNumber = i + 2; // +2 because row 1 is the header, and index is 0-based

        const firstName = String(contact['First name'] ?? '').trim();
        const lastName = String(contact['Last name'] ?? '').trim();
        const email = String(contact['Email'] ?? '').trim();
        const mobile = String(contact['Mobile'] ?? '').trim();

        // Validate required fields
        if (!firstName && !lastName) {
          errors.push({
            row: rowNumber,
            reason: 'Prénom ou nom requis',
          });
          continue;
        }

        if (!email && !mobile) {
          errors.push({
            row: rowNumber,
            reason: 'Email ou mobile requis',
          });
          continue;
        }

        // Check for duplicates
        const duplicateFilter: any[] = [];
        if (mobile) duplicateFilter.push({ mobileNumber: mobile });
        if (email) duplicateFilter.push({ email });

        const existingContact = await this.contactProvider.ContactModel.findOne(
          {
            $or: duplicateFilter,
          }
        )
          .lean()
          .exec();

        if (existingContact) {
          skippedCount++;
          this._logger.log(
            `Row ${rowNumber}: duplicate contact (${email || mobile}) — skipped`
          );
          continue;
        }

        contactsModel.push({
          firstName,
          lastName,
          mobileNumber: mobile,
          jobTitle: String(contact['Job title'] ?? '').trim(),
          email,
          createdBy: this.contactProvider.user().userId,
          createdByInfo: this.contactProvider.user(),
        });
      }

      // Insert valid, non-duplicate contacts
      let createdCount = 0;
      if (contactsModel.length > 0) {
        const createdContacts =
          await this.contactProvider.ContactModel.insertMany(contactsModel);
        createdCount = createdContacts.length;
      }

      // Delete file after processing
      await fs.remove(command.excelFile as string);

      return {
        createdCount,
        skippedCount,
        errorCount: errors.length,
        errors,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this._logger.error(JSON.stringify(error));
      throw new BadRequestException(
        "Une erreur survenue lors de l'import des contacts"
      );
    }
  }
}
