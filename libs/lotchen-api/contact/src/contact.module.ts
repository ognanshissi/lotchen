import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { contactProviders } from './contact.provider';
import { CreateContactCommandHandler } from './create/create-contact.command';
import { FindAllContactsQueryHandler } from './find-all/find-all-contacts.query';
import { FindContactByQueryHandler } from './find-by-id/find-contact-by-id.query';
import { UpdateContactCommandHandler } from './update/update-contact.command';
import { PaginateAllContactsCommandHandler } from './paginate-all/paginate-all-contacts.command';

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
  ],
  exports: [],
})
export class ContactModule {}
