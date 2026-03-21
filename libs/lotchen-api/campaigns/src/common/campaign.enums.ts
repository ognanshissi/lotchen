export enum CampaignChannel {
  Email = 'email',
  Sms = 'sms',
  WhatsApp = 'whatsapp',
}

export enum CampaignStatus {
  Draft = 'draft',
  Scheduled = 'scheduled',
  Sending = 'sending',
  Sent = 'sent',
  Cancelled = 'cancelled',
}

export enum MessageStatus {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Bounced = 'bounced',
  Opened = 'opened',
  Clicked = 'clicked',
  Unsubscribed = 'unsubscribed',
  Failed = 'failed',
}
