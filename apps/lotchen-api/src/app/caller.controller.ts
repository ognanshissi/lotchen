import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
const twilio = require('twilio');

@Controller({
  path: 'caller',
  version: '1',
})
@ApiTags('Caller')
export class CallerController {
  @Get('make-call')
  async connectClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);
    const call = await client.calls.create({
      from: process.env.TWILIO_TEST_PHONE_NUMBER,
      to: '+2250777132974',
      url: 'http://demo.twilio.com/docs/voice.xml',
    });

    console.log(call);
  }
}
