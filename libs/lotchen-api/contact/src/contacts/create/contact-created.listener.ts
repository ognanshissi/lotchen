import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContactProvider } from '../contact.provider';
import { ContactStatus } from '../contact-status.enum';
import {
  CONTACT_CREATED,
  ContactCreatedEvent,
} from '@lotchen/lotchen-api/events/contact-created.event';

@Injectable()
export class ContactCreatedListener {
  private readonly _logger = new Logger(ContactCreatedListener.name);

  public constructor(private readonly contactProvider: ContactProvider) {}

  @OnEvent(CONTACT_CREATED, { async: true })
  public async handleContactCreatedEvent(payload: ContactCreatedEvent) {
    try {
      this._logger.debug(`Event: ${CONTACT_CREATED} is triggered`);

      const contact = await this.contactProvider.ContactModel.findOne({
        _id: payload.contactId.toString() as any,
      });

      this._logger.log(`Contact: ${JSON.stringify(contact)}`);

      if (!contact) {
        this._logger.log(
          `Contact with Id: ${payload.contactId} is not found !`
        );
        return;
      }

      const contactHistory = {
        previousStatus: ContactStatus.New,
        changedAt: new Date(),
        changedBy: payload.actionAuthorId,
        status: payload.status,
      };

      await this.contactProvider.ContactModel.updateOne(
        { _id: payload.contactId.toString() as any },
        {
          $addToSet: {
            statusHistory: contactHistory,
          },
        }
      );

      // contact.statusHistory.push(contactHistory);
      this._logger.log(
        `Contact ${payload.contactId} status updated to ${payload.status}`
      );
    } catch (error) {
      this._logger.log(
        `Error while handling contact status change event: ${error}`
      );
    }
  }
}
