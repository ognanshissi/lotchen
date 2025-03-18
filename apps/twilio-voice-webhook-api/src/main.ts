/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { voiceResponse } from './handler';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/api/voice', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(voiceResponse(req.body));
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
