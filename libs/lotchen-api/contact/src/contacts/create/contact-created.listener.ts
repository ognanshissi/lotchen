import { Injectable, Logger } from '@nestjs/common';
import { CONTACT_CREATED, ContactCreatedEvent } from './contact-created.event';
import { TenantDatabaseService } from '@lotchen/api/core';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ContactCreatedListener {
  private readonly _logger = new Logger(ContactCreatedListener.name);

  public constructor(
    private readonly _tenantDatabaseService: TenantDatabaseService
  ) {}

  @OnEvent(CONTACT_CREATED, { async: true })
  public async handleContactCreatedEvent(payload: ContactCreatedEvent) {
    try {
      const db = await this._tenantDatabaseService.getTenantDatabase(
        payload.tenantId
      );
      const contactCollection = db.collection('contact_contacts');

      this._logger.log(`Event payload: ${JSON.stringify(payload)}`);

      const contact = await contactCollection.findOne({
        _id: payload.contactId as any,
      });

      this._logger.log(`Contact: ${JSON.stringify(contact)}`);

      if (!contact) {
        this._logger.log(
          `Contact with Id: ${payload.contactId} is not found !`
        );
        return;
      }

      const contactHistory = {
        previousStatus: '',
        changedAt: new Date(),
        changedBy: payload.actionAuthorId,
        status: payload.status,
      };

      await contactCollection.updateOne(
        { id: payload.contactId },
        {
          $addToSet: {
            statusHistory: contactHistory,
          },
        }
      );

      // contact.statusHistory.push(contactHistory);
      this._logger.log(
        `Contact ${payload.contactId} status updated to ${payload.status} for Tenant ${payload.tenantId}`
      );
    } catch (error) {
      await (
        await this._tenantDatabaseService.getTenantDatabase(payload.tenantId)
      ).close();
      this._logger.log(
        `Error while handling contact status change event: ${error}`
      );
    }
  }
}
