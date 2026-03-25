const VoiceResponse = require('twilio').twiml.VoiceResponse;

const RECORDING_CALLBACK_PATH = '/recording-callback';

export const voiceResponse = function voiceResponse(requestBody: any) {
  const toNumberOrClientName = requestBody.To;
  const callerId = process.env.TWILIO_CALLER_ID;
  const twiml = new VoiceResponse();

  // Extract target identity from request params (sent by frontend)
  // Falls back to From client identity for incoming calls
  const targetIdentity = requestBody.targetIdentity || '';
  const enableRecording = requestBody.enableRecording === 'true';
  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || '';

  // If the request to the /voice endpoint is TO your Twilio Number,
  // then it is an incoming call towards your Twilio.Device.
  if (toNumberOrClientName == callerId) {
    const dialOptions: any = {};
    if (enableRecording) {
      dialOptions.record = 'record-from-answer-dual';
      if (webhookBaseUrl) {
        dialOptions.recordingStatusCallback = `${webhookBaseUrl}${RECORDING_CALLBACK_PATH}`;
        dialOptions.recordingStatusCallbackEvent = 'completed';
      }
    }
    const dial = twiml.dial(dialOptions);

    // Connect to specific identity if provided, otherwise connect to all registered clients
    if (targetIdentity) {
      dial.client(targetIdentity);
    } else {
      // Accept all registered clients — Twilio will ring the first available
      dial.client(requestBody.From?.replace('client:', '') || 'default');
    }
  } else if (requestBody.To) {
    // This is an outgoing call

    const dialOptions: any = { callerId };
    if (enableRecording) {
      dialOptions.record = 'record-from-answer-dual';
      if (webhookBaseUrl) {
        dialOptions.recordingStatusCallback = `${webhookBaseUrl}${RECORDING_CALLBACK_PATH}`;
        dialOptions.recordingStatusCallbackEvent = 'completed';
      }
    }
    const dial = twiml.dial(dialOptions);

    // Check if the 'To' parameter is a Phone Number or Client Name
    // in order to use the appropriate TwiML noun
    const attr = isAValidPhoneNumber(toNumberOrClientName)
      ? 'number'
      : 'client';
    dial[attr]({}, toNumberOrClientName);
  } else {
    twiml.say('Thanks for calling!');
  }

  return twiml.toString();
};

/**
 * Checks if the given value is valid as phone number
 * @param {Number|String} number
 * @return {Boolean}
 */
function isAValidPhoneNumber(number: string) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}
