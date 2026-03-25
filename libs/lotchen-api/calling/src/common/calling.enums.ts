export enum TelephonyProvider {
  Twilio = 'twilio',
  RingOver = 'ringover',
  Asterisk = 'asterisk',
}

export enum RecordingConsentMode {
  AutoAnnounce = 'auto-announce',
  Manual = 'manual',
  Disabled = 'disabled',
}

export enum CallDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

export enum CallDisposition {
  Interested = 'interested',
  NotInterested = 'not-interested',
  Callback = 'callback',
  Voicemail = 'voicemail',
  WrongNumber = 'wrong-number',
  NoAnswer = 'no-answer',
  Busy = 'busy',
}

export enum FollowUpAction {
  CallBack = 'call-back',
  SendEmail = 'send-email',
  ScheduleMeeting = 'schedule-meeting',
  None = 'none',
}
