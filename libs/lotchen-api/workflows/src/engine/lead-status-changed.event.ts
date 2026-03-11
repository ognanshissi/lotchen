export const LEAD_STATUS_CHANGED = 'lead.status_changed';

export class LeadStatusChangedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly contactId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly changedByUserId: string
  ) {}
}
