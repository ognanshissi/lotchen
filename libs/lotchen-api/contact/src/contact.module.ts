import { Module } from '@nestjs/common';
import { ContactsController } from './contacts/contacts.controller';
import { contactProviders } from './contacts/contact.provider';
import { CreateContactCommandHandler } from './contacts/create/create-contact.command';
import { FindAllContactsQueryHandler } from './contacts/find-all/find-all-contacts.query';
import { FindContactByQueryHandler } from './contacts/find-by-id/find-contact-by-id.query';
import { UpdateContactCommandHandler } from './contacts/update/update-contact.command';
import { PaginateAllContactsCommandHandler } from './contacts/paginate-all/paginate-all-contacts.command';
import { ImportContactsExcelCommandHandler } from './contacts/import-contacts-excel/import-contacts-excel.command';
import { CreateCallLogCommandHandler } from './contacts/create-call-log/create-call-log.command';
import { ContactCreatedListener } from './contacts/create/contact-created.listener';

@Module({
  imports: [],
  controllers: [ContactsController],
  providers: [
    ...contactProviders,
    CreateContactCommandHandler,
    FindAllContactsQueryHandler,
    FindContactByQueryHandler,
    UpdateContactCommandHandler,
    PaginateAllContactsCommandHandler,
    ImportContactsExcelCommandHandler,
    CreateCallLogCommandHandler,
    ContactCreatedListener,
  ],
  exports: [],
})
export class ContactModule {}
