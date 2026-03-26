import { Module } from '@nestjs/common';
import { ContactsController } from './contacts/contacts.controller';
import { ContactProvider, contactProviders } from './contacts/contact.provider';
import { CreateContactCommandHandler } from './contacts/create/create-contact.command';
import { FindAllContactsQueryHandler } from './contacts/find-all/find-all-contacts.query';
import { FindContactByQueryHandler } from './contacts/find-by-id/find-contact-by-id.query';
import { UpdateContactCommandHandler } from './contacts/update/update-contact.command';
import { PaginateAllContactsCommandHandler } from './contacts/paginate-all/paginate-all-contacts.command';
import { ImportContactsExcelCommandHandler } from './contacts/import-contacts-excel/import-contacts-excel.command';
import { CreateCallLogCommandHandler } from './call-logs/create-call-log/create-call-log.command';
import { ContactCreatedListener } from './contacts/create/contact-created.listener';
import { CallLogsController } from './call-logs/call-logs.controller';
import { FindAllCallLogsQueryHandler } from './call-logs/find-call-logs/find-call-logs.query';
import { PatchDataCommandHandler } from './contacts/patch-data/patch-data.command';
import {
  BulkDeleteContactsCommandHandler,
  DeleteContactCommandHandler,
} from './contacts/delete/delete-contact.command';
import {
  AssignContactCommandHandler,
  BulkAssignContactsCommandHandler,
} from './contacts/assign/assign-contact.command';
import { UpdateContactStatusCommandHandler } from './contacts/update-status/update-contact-status.command';
// Leads
import { LeadsController } from './leads/leads.controller';
import { LeadProvider } from './leads/lead.provider';
import { CreateLeadCommandHandler } from './leads/create/create-lead.command';
import { PaginateAllLeadsCommandHandler } from './leads/paginate-all/paginate-all-leads.command';
import { FindLeadByIdQueryHandler } from './leads/find-by-id/find-lead-by-id.query';
import { UpdateLeadCommandHandler } from './leads/update/update-lead.command';
import { DeleteLeadCommandHandler } from './leads/delete/delete-lead.command';
import { QualifyLeadCommandHandler } from './leads/qualify/qualify-lead.command';
import { DisqualifyLeadCommandHandler } from './leads/disqualify/disqualify-lead.command';
import { ConvertLeadCommandHandler } from './leads/convert/convert-lead.command';
import { CaptureLeadCommandHandler } from './leads/capture/capture-lead.command';
import { WebhookLeadCommandHandler } from './leads/capture/webhook-lead.command';
import { EnrichLeadCommandHandler } from './leads/enrich/enrich-lead.command';
import { UpdateCallLogCommandHandler } from './call-logs/update-call-log/update-call-log.command';
import { RecordingCallbackCommandHandler } from './call-logs/recording-callback/recording-callback.command';
// Capture Config
import {
  CaptureConfigController,
  CaptureConfigProvider,
  captureConfigProviders,
  CreateCaptureConfigCommandHandler,
  FindAllCaptureConfigsQueryHandler,
  UpdateCaptureConfigCommandHandler,
  DeleteCaptureConfigCommandHandler,
  GenerateScriptQueryHandler,
} from './leads/capture-config';
import { ImportLinkedInPostCommandHandler } from './leads/capture/import-linkedin-post.command';

@Module({
  imports: [],
  controllers: [
    ContactsController,
    CallLogsController,
    LeadsController,
    CaptureConfigController,
  ],
  providers: [
    ...contactProviders,
    ...captureConfigProviders,
    CreateContactCommandHandler,
    FindAllContactsQueryHandler,
    FindContactByQueryHandler,
    UpdateContactCommandHandler,
    PaginateAllContactsCommandHandler,
    ImportContactsExcelCommandHandler,
    CreateCallLogCommandHandler,
    ContactCreatedListener,
    FindAllCallLogsQueryHandler,
    UpdateCallLogCommandHandler,
    RecordingCallbackCommandHandler,
    PatchDataCommandHandler,
    DeleteContactCommandHandler,
    BulkDeleteContactsCommandHandler,
    AssignContactCommandHandler,
    BulkAssignContactsCommandHandler,
    UpdateContactStatusCommandHandler,
    // Leads
    LeadProvider,
    CreateLeadCommandHandler,
    PaginateAllLeadsCommandHandler,
    FindLeadByIdQueryHandler,
    UpdateLeadCommandHandler,
    DeleteLeadCommandHandler,
    QualifyLeadCommandHandler,
    DisqualifyLeadCommandHandler,
    ConvertLeadCommandHandler,
    CaptureLeadCommandHandler,
    WebhookLeadCommandHandler,
    EnrichLeadCommandHandler,
    // Capture Config
    CaptureConfigProvider,
    CreateCaptureConfigCommandHandler,
    FindAllCaptureConfigsQueryHandler,
    UpdateCaptureConfigCommandHandler,
    DeleteCaptureConfigCommandHandler,
    GenerateScriptQueryHandler,
    ImportLinkedInPostCommandHandler,
  ],
  exports: [ContactProvider],
})
export class ContactModule {}
