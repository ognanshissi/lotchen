export const CONTACT_STATUS_CHANGED = 'contact.status_changed';

export class ContactStatusChangedEvent {
  constructor(
    public contactId: string,
    public previousStatus: string,
    public newStatus: string,
    public changedByUserId: string
  ) {}
}

export const LEAD_STATUS_CHANGED = 'lead.status_changed';

export class LeadStatusChangedEvent {
  constructor(
    public readonly contactId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly changedByUserId: string
  ) {}
}

export const LEAD_CONVERT_TO_PROSPECT_CHANGED =
  'lead.convert_to_prospect_changed';

export class LeadConvertToProspectChangedEvent {
  constructor(public readonly contactId: string) {}
}
