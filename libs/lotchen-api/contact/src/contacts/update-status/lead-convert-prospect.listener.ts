import { Injectable, Logger } from '@nestjs/common';
import { ContactProvider } from '../contact.provider';
import { OnEvent } from '@nestjs/event-emitter';
import {
  LEAD_CONVERT_TO_PROSPECT_CHANGED,
  LeadConvertToProspectChangedEvent,
} from '@lotchen/lotchen-api/events/contact-status-changed.event';

@Injectable()
export class LeadConvertToProspectListener {
  private readonly _logger = new Logger(LeadConvertToProspectListener.name);

  public constructor(private readonly contactProvider: ContactProvider) {}

  @OnEvent(LEAD_CONVERT_TO_PROSPECT_CHANGED, { async: true })
  public async handleConvertToProspectChangedEvent(
    payload: LeadConvertToProspectChangedEvent
  ) {
    this._logger.debug(
      `Event ${LEAD_CONVERT_TO_PROSPECT_CHANGED}:`,
      payload.contactId
    );

    await this.contactProvider.ContactModel.findByIdAndUpdate(
      payload.contactId,
      {
        $set: { type: 'Prospect' },
      }
    );
  }
}
