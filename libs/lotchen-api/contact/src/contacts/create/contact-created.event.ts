export const CONTACT_CREATED = 'contact.created';

export class ContactCreatedEvent {
  constructor(
    public contactId: string,
    public actionAuthorId: string, // User Id
    public email: string,
    public mobileNumber: string,
    public status: string
  ) {}
}
