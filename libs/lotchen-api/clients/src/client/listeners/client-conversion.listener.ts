import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientsProvider } from '../../clients.provider';
import {
  ClientStatus,
  KycStatus,
  AccountType,
} from '../../common/client.enums';

export interface ClientConversionEvent {
  contactId: string;
  contact: any;
  userId: string;
  userInfo: any;
}

export const CLIENT_CONVERSION_REQUESTED = 'CLIENT_CONVERSION_REQUESTED';

@Injectable()
export class ClientConversionListener {
  constructor(private readonly clientsProvider: ClientsProvider) {}

  @OnEvent(CLIENT_CONVERSION_REQUESTED)
  async handleClientConversion(event: ClientConversionEvent): Promise<void> {
    const { contact, userId, userInfo } = event;

    const lastClient = await this.clientsProvider.ClientModel.findOne(
      {},
      { clientNumber: 1 }
    )
      .sort({ clientNumber: -1 })
      .lean()
      .exec();

    let nextNumber = 1;
    if (lastClient?.clientNumber) {
      const num = parseInt(lastClient.clientNumber.replace('CL-', ''), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
    const clientNumber = `CL-${String(nextNumber).padStart(7, '0')}`;

    const client = new this.clientsProvider.ClientModel({
      clientNumber,
      contactId: contact._id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      mobileNumber: contact.mobileNumber,
      phone: contact.phone,
      dateOfBirth: contact.dateOfBirth,
      gender: contact.gender,
      jobTitle: contact.jobTitle,
      companyName: contact.companyName,
      addresses: contact.addresses ?? [],
      source: contact.source,
      status: ClientStatus.Active,
      kycStatus: KycStatus.NotStarted,
      accountType: AccountType.Individual,
      onboardingDate: new Date(),
      creditScore: contact.creditScore,
      monthlyIncome: contact.monthlyIncome,
      employmentStatus: contact.employmentStatus,
      assignedToUserId: contact.assignedToUserId,
      assignedToTeamId: contact.assignedToTeamId,
      territoryId: contact.territoryId,
      agencyId: contact.agencyId,
      tags: contact.tags ?? [],
      customFields: contact.customFields,
      createdBy: userId,
      createdByInfo: userInfo,
    });

    await client.save();
  }
}
