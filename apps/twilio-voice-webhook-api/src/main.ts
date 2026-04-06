import express from 'express';
import * as path from 'path';
import { voiceResponse } from './handler';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/voice', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(voiceResponse(req.body));
});

app.post('/recording-callback', async (req, res) => {
  const { RecordingUrl, RecordingSid, CallSid } = req.body;
  const mainApiUrl = process.env.MAIN_API_URL || 'http://localhost:3000';

  try {
    await fetch(`${mainApiUrl}/api/v1/call-logs/recording-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callSid: CallSid,
        recordingUrl: RecordingUrl,
        recordingSid: RecordingSid,
      }),
    });
  } catch (error) {
    console.error('Failed to forward recording callback:', error);
  }

  res.sendStatus(200);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
server.on('error', console.error);
