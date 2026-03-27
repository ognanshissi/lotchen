# Test Plan — Twilio Voice Call: Configuration, Calling & Recording

> End-to-end test plan covering telephony setup, outbound/inbound calls, call recording, and call log display.

---

## Prerequisites

| Item                    | Detail                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Twilio Account          | Active account with Voice capability                                                                                   |
| Twilio Phone Number     | Purchased number (the Caller ID)                                                                                       |
| Twilio API Key + Secret | Created from Twilio Console > API Keys                                                                                 |
| TwiML App               | Created in Console with Voice Request URL pointing to the webhook app (`https://<WEBHOOK_HOST>/voice`)                 |
| Webhook App Running     | `apps/twilio-voice-webhook-api` deployed/running with env vars: `TWILIO_CALLER_ID`, `WEBHOOK_BASE_URL`, `MAIN_API_URL` |
| Backend API Running     | `apps/lotchen-api` running on `MAIN_API_URL`                                                                           |
| Frontend Running        | `apps/Lotchen` running                                                                                                 |
| Test Tenant             | Valid tenant with `x-tenant-fqdn` configured                                                                           |
| Test User               | Logged-in user with appropriate permissions                                                                            |
| Test Contact            | At least one contact/lead with a valid mobile number                                                                   |
| Browser                 | Chrome or Firefox with microphone permissions                                                                          |

---

## TP-1: Twilio Telephony Configuration

### TP-1.1 — Navigate to telephony settings

| Step | Action                                                    | Expected Result                                                                                                          |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1    | Go to **Settings > Canaux de communication > Téléphonie** | Settings page loads at `/settings/telephony`                                                                             |
| 2    | Observe the page layout                                   | "Configuration Téléphonie" title visible; provider radio buttons (Twilio, RingOver, Asterisk); loading spinner then form |

### TP-1.2 — Configure Twilio provider

| Step | Action                                          | Expected Result                                                                                                                        |
| ---- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Select **Twilio** radio button                  | Twilio config card appears with fields: Account SID, API Key, API Secret, TwiML App SID, Caller ID                                     |
| 2    | Fill in **Account SID** (`ACxxxxxxx`)           | Field accepts text input                                                                                                               |
| 3    | Fill in **API Key** (`SKxxxxxxx`)               | Field accepts text input                                                                                                               |
| 4    | Fill in **API Secret**                          | Field is password-masked                                                                                                               |
| 5    | Fill in **TwiML App SID** (`APxxxxxxx`)         | Field accepts text input                                                                                                               |
| 6    | Fill in **Caller ID** (`+1234567890`)           | Field accepts phone number                                                                                                             |
| 7    | Check **"Activer l'enregistrement des appels"** | Recording consent dropdown appears                                                                                                     |
| 8    | Select **"Annonce automatique"** consent mode   | Dropdown value set to `auto-announce`                                                                                                  |
| 9    | Click **Enregistrer**                           | Button shows "Enregistrement..."; success snackbar "Configuration téléphonie enregistrée"; `POST /api/v1/telephony-config` returns 201 |
| 10   | Refresh the page                                | Form reloads with all saved values pre-filled; provider = Twilio; recording enabled = checked; consent = auto-announce                 |

### TP-1.3 — Verify backend persistence

| Step | Action                                                            | Expected Result                                                                                                                               |
| ---- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Call `GET /api/v1/telephony-config` (with `x-tenant-fqdn` header) | Returns JSON with `provider: "twilio"`, `twilioConfig` containing all 5 fields, `recordingEnabled: true`, `recordingConsent: "auto-announce"` |
| 2    | Check MongoDB `telephony_configs` collection                      | Document exists with correct tenant, all Twilio fields stored, audit fields (`createdBy`, `createdAt`) populated                              |

### TP-1.4 — Update existing configuration

| Step | Action                                 | Expected Result                                                                       |
| ---- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| 1    | Change Caller ID to a different number | Field updated                                                                         |
| 2    | Uncheck recording                      | Consent dropdown disappears                                                           |
| 3    | Click **Enregistrer**                  | Success snackbar; `POST /api/v1/telephony-config` upserts (does not create duplicate) |
| 4    | Verify via API                         | Config updated; only one document in collection; `updatedBy` populated                |

### TP-1.5 — Validation: missing fields

| Step | Action                           | Expected Result                                                                                   |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1    | Clear Account SID field and save | Config saved (fields are not required at form level — backend stores whatever is provided)        |
| 2    | Attempt a call (see TP-2)        | Token generation fails gracefully; caller component shows error or stays in "Chargement..." state |

---

## TP-2: Making an Outbound Call

### TP-2.1 — Initiate call from contact detail

| Step | Action                                                | Expected Result                                                                                      |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1    | Navigate to a contact's detail page                   | Contact detail loads with call button visible                                                        |
| 2    | Click the **call button** (phone icon) on the contact | Caller dialog opens (floating 320×500px window)                                                      |
| 3    | Observe the dialog                                    | Shows contact name, avatar circle, phone number; status = "Chargement..." while fetching token       |
| 4    | Wait for token fetch                                  | `POST /api/v1/caller/token` returns Twilio JWT; Twilio Device registers; status changes to "Appeler" |

### TP-2.2 — Execute the call

| Step | Action                                  | Expected Result                                                                                                                                        |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Click the **green call button**         | Status changes to "Appel en cours..."; `Device.connect()` called; TwiML webhook receives request at `/voice` with `To=<phone>`, `enableRecording=true` |
| 2    | Recipient's phone rings                 | Twilio routes call to the number via TwiML `<Dial>` verb                                                                                               |
| 3    | Recipient answers                       | Status changes to "En ligne"; timer starts counting (0:00, 0:01, ...)                                                                                  |
| 4    | Have a short conversation (~10 seconds) | Timer increments; audio bidirectional                                                                                                                  |
| 5    | Click the **red hang-up button**        | Call disconnects; timer stops; status = "Appel terminé"                                                                                                |

### TP-2.3 — Post-call disposition

| Step | Action                                           | Expected Result                                                                                                                                                                                                                                                                    |
| ---- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | After hang-up, observe the dialog                | Disposition form appears with: dropdown (Intéressé, Pas intéressé, Rappel, Messagerie, Mauvais n°, Pas de réponse, Occupé), note textarea, follow-up date, follow-up action                                                                                                        |
| 2    | Select disposition **"Intéressé"**               | Dropdown value set                                                                                                                                                                                                                                                                 |
| 3    | Type a note: "Client intéressé par le produit X" | Textarea populated                                                                                                                                                                                                                                                                 |
| 4    | Set follow-up date to tomorrow                   | Date populated                                                                                                                                                                                                                                                                     |
| 5    | Select follow-up action **"Rappel"**             | Dropdown set to `call-back`                                                                                                                                                                                                                                                        |
| 6    | Click **Sauvegarder**                            | `POST /api/v1/call-logs` called with: `entityType`, `relatedToId`, `recipientContact`, `callSid`, `fromAgentId`, `duration`, `startDate`, `endDate`, `status: "completed"`, `direction: "outbound"`, `provider: "twilio"`, `disposition`, `note`, `followUpDate`, `followUpAction` |
| 7    | Observe result                                   | Snackbar or dialog closes; call log created                                                                                                                                                                                                                                        |

### TP-2.4 — Call with no answer

| Step | Action                               | Expected Result                                                        |
| ---- | ------------------------------------ | ---------------------------------------------------------------------- |
| 1    | Call a number that won't answer      | Status = "Appel en cours..." for ~30 seconds                           |
| 2    | Hang up or wait for timeout          | Status = "Appel terminé"; disposition form appears                     |
| 3    | Select **"Pas de réponse"** and save | Call log created with `status: "no-reply"`, `disposition: "no-answer"` |

### TP-2.5 — Cancel call before connection

| Step | Action                    | Expected Result                                                                        |
| ---- | ------------------------- | -------------------------------------------------------------------------------------- |
| 1    | Start a call              | Status = "Appel en cours..."                                                           |
| 2    | Click hang-up immediately | Call cancelled; status = "Appel terminé"; disposition form appears with option to skip |

### TP-2.6 — Minimize/maximize caller dialog

| Step | Action                                   | Expected Result                                  |
| ---- | ---------------------------------------- | ------------------------------------------------ |
| 1    | During a call, click the minimize button | Dialog collapses to a compact floating indicator |
| 2    | Click to expand                          | Full dialog restored with timer still running    |

---

## TP-3: Call Recording

### TP-3.1 — Verify recording is enabled

| Step | Action                                               | Expected Result                                                                                                    |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | Ensure telephony config has `recordingEnabled: true` | Verified via Settings page or API                                                                                  |
| 2    | Make an outbound call (as in TP-2.2)                 | Call initiated with `enableRecording=true` parameter                                                               |
| 3    | Check webhook app `/voice` handler                   | TwiML response includes `record="record-from-answer-dual"` attribute on `<Dial>` and `recordingStatusCallback` URL |

### TP-3.2 — Recording callback flow

| Step | Action                                                | Expected Result                                                                                                              |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1    | Complete a call (answer + hang up + save disposition) | Call log created with `callSid` populated                                                                                    |
| 2    | Wait 5–30 seconds for Twilio to process recording     | Twilio sends POST to `<WEBHOOK_BASE_URL>/recording-callback` with `CallSid`, `RecordingUrl`, `RecordingSid`                  |
| 3    | Webhook app forwards to main API                      | `POST /api/v1/call-logs/recording-callback` called (public endpoint, no auth) with `{ callSid, recordingUrl, recordingSid }` |
| 4    | Check the call log in database                        | Call log document updated: `recordingUrl` and `recordingSid` now populated                                                   |

### TP-3.3 — Recording with disabled setting

| Step | Action                                               | Expected Result                                                                          |
| ---- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1    | Go to Settings > Téléphonie, uncheck recording, save | `recordingEnabled: false`                                                                |
| 2    | Make a call                                          | Token response has recording disabled; call params do NOT include `enableRecording=true` |
| 3    | Complete the call                                    | No recording callback fires; call log has `recordingUrl: null`                           |

---

## TP-4: Call Logs Display

### TP-4.1 — Navigate to call logs tab

| Step | Action                                           | Expected Result                                                                                      |
| ---- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1    | Go to a contact's detail page                    | Detail page loads                                                                                    |
| 2    | Click the **"Journal d'appels"** / Call Logs tab | Call logs component loads; API call `GET /api/v1/call-logs/<contactId>` fires                        |
| 3    | Observe the table                                | Table with columns: Direction, Date, Numéro, Durée, Statut, Disposition, Enregistrement, Note, Agent |

### TP-4.2 — Verify call log data display

| Step | Action                         | Expected Result                                             |
| ---- | ------------------------------ | ----------------------------------------------------------- |
| 1    | Locate the call made in TP-2.2 | Row visible in the table                                    |
| 2    | Check **Direction** column     | Outbound arrow icon displayed                               |
| 3    | Check **Date** column          | Formatted as `dd/MM/yyyy HH:mm`; matches the call timestamp |
| 4    | Check **Numéro** column        | Shows the recipient's phone number                          |
| 5    | Check **Durée** column         | Shows duration in `Xm Ys` format (e.g. "0m 10s")            |
| 6    | Check **Statut** column        | Green badge "completed" or "replied"                        |
| 7    | Check **Disposition** column   | Shows "Intéressé" (matching what was selected in TP-2.3)    |
| 8    | Check **Agent** column         | Shows the logged-in user's name                             |

### TP-4.3 — Recording playback

| Step | Action                                           | Expected Result                                                             |
| ---- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| 1    | Locate a call log with a recording (from TP-3.2) | Recording player button visible in the Enregistrement column                |
| 2    | Click the **play button**                        | Audio starts playing; icon toggles to pause; time counter increments (M:SS) |
| 3    | Click **pause**                                  | Audio pauses; icon toggles back to play                                     |
| 4    | Let recording play to end                        | Player resets; icon shows play again                                        |

### TP-4.4 — Call without recording

| Step | Action                                            | Expected Result                                                           |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| 1    | Locate a call log without recording (from TP-3.3) | No player button in the Enregistrement column; cell is empty or shows "-" |

### TP-4.5 — Inline note editing

| Step | Action                                   | Expected Result                                                                                                               |
| ---- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1    | Click on the **note cell** of a call log | Text input appears with current note text; `editingNoteId` set                                                                |
| 2    | Modify the text to "Note mise à jour"    | Input reflects change                                                                                                         |
| 3    | Press **Enter**                          | `PATCH /api/v1/call-logs/<logId>` called with `{ note: "Note mise à jour" }`; input reverts to text display with updated note |
| 4    | Press **Escape** instead of Enter        | Edit cancelled; original note restored                                                                                        |

### TP-4.6 — Multiple call logs ordering

| Step | Action                           | Expected Result                                              |
| ---- | -------------------------------- | ------------------------------------------------------------ |
| 1    | Make 3 calls to the same contact | 3 call logs created                                          |
| 2    | Open the call logs tab           | All 3 visible; sorted by date descending (most recent first) |

### TP-4.7 — Call logs for contact with no calls

| Step | Action                                          | Expected Result                                          |
| ---- | ----------------------------------------------- | -------------------------------------------------------- |
| 1    | Navigate to a contact who has never been called | Call logs tab shows empty table or "Aucun appel" message |

---

## TP-5: Inbound Calls

### TP-5.1 — Receive an inbound call

| Step | Action                                                                        | Expected Result                                                                                                   |
| ---- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1    | Ensure the agent has an active Twilio Device (page is open, token registered) | Device registered via `Device.register()`                                                                         |
| 2    | Call the Twilio phone number from an external phone                           | TwiML webhook receives inbound call; `To` matches `TWILIO_CALLER_ID`; handler dials registered client(s)          |
| 3    | Observe the CRM                                                               | Caller dialog opens automatically with "Appel entrant" status; shows caller number; Accept/Reject buttons visible |
| 4    | Click **Accept**                                                              | Call connects; status = "En ligne"; timer starts                                                                  |
| 5    | Hang up                                                                       | Disposition form appears; fill and save                                                                           |
| 6    | Check call log                                                                | Entry created with `direction: "inbound"`                                                                         |

### TP-5.2 — Reject an inbound call

| Step | Action                  | Expected Result                                       |
| ---- | ----------------------- | ----------------------------------------------------- |
| 1    | Receive an inbound call | Dialog appears with Accept/Reject                     |
| 2    | Click **Reject**        | Call rejected; dialog closes or shows "Appel terminé" |

---

## TP-6: Edge Cases & Error Handling

### TP-6.1 — Invalid Twilio credentials

| Step | Action                                              | Expected Result                                                                                               |
| ---- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1    | Set an invalid API Key in telephony config and save | Config saved                                                                                                  |
| 2    | Attempt to make a call                              | Token generation fails; `POST /api/v1/caller/token` returns error; caller dialog shows loading state or error |

### TP-6.2 — Webhook app unreachable

| Step | Action               | Expected Result                                                                                                         |
| ---- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Stop the webhook app | App down                                                                                                                |
| 2    | Make a call          | Twilio cannot reach TwiML endpoint; call fails; no audio connection; status stays at "Appel en cours..." then times out |

### TP-6.3 — Recording callback failure

| Step | Action                                                  | Expected Result                                                                                                       |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1    | Set `MAIN_API_URL` to an invalid URL in the webhook app | Forwarding will fail                                                                                                  |
| 2    | Make a recorded call and hang up                        | Twilio sends recording callback to webhook; webhook fails to forward to main API; recording URL NOT saved on call log |
| 3    | Call log still exists                                   | Call log has `recordingUrl: null`; no player shown                                                                    |

### TP-6.4 — Invalid phone number

| Step | Action                                                           | Expected Result                                                                  |
| ---- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1    | Try to call a contact with an invalid mobile number (e.g. "abc") | `CallerService` validates number; dialog does not open or shows validation error |

### TP-6.5 — Concurrent calls

| Step | Action                                  | Expected Result                                       |
| ---- | --------------------------------------- | ----------------------------------------------------- |
| 1    | Open a call to contact A                | Caller dialog opens, call in progress                 |
| 2    | Try to call contact B while A is active | Second call prevented; only one active call at a time |

---

## TP-7: API-Level Verification

### TP-7.1 — Token endpoint

```
POST /api/v1/caller/token
Headers: Authorization: Bearer <jwt>, x-tenant-fqdn: <tenant>

Expected 200:
{
  "token": "<twilio_jwt>",
  "identity": "<user_email_or_id>",
  "provider": "twilio",
  "recordingEnabled": true,
  "callerId": "+1234567890"
}
```

### TP-7.2 — Create call log endpoint

```
POST /api/v1/call-logs
Headers: Authorization: Bearer <jwt>, x-tenant-fqdn: <tenant>
Body:
{
  "entityType": "Contact",
  "relatedToId": "<contact_uuid>",
  "recipientContact": "+1234567890",
  "callSid": "CA...",
  "duration": 15,
  "startDate": "2026-03-27T10:00:00Z",
  "endDate": "2026-03-27T10:00:15Z",
  "status": "completed",
  "direction": "outbound",
  "provider": "twilio",
  "disposition": "interested",
  "note": "Client intéressé",
  "followUpDate": "2026-03-28T10:00:00Z",
  "followUpAction": "call-back"
}

Expected 201
```

### TP-7.3 — Fetch call logs endpoint

```
GET /api/v1/call-logs/<contact_uuid>
Headers: Authorization: Bearer <jwt>, x-tenant-fqdn: <tenant>

Expected 200: Array of call log objects sorted by createdAt desc
```

### TP-7.4 — Recording callback endpoint (public)

```
POST /api/v1/call-logs/recording-callback
Body:
{
  "callSid": "CA...",
  "recordingUrl": "https://api.twilio.com/...",
  "recordingSid": "RE..."
}

Expected 200/204: Call log updated with recording metadata
```

### TP-7.5 — Update call log endpoint

```
PATCH /api/v1/call-logs/<log_uuid>
Headers: Authorization: Bearer <jwt>, x-tenant-fqdn: <tenant>
Body: { "note": "Updated note" }

Expected 204
```

---

## Summary Matrix

| Test ID    | Scenario                | Priority |
| ---------- | ----------------------- | -------- |
| TP-1.1     | Navigate to settings    | P0       |
| TP-1.2     | Configure Twilio        | P0       |
| TP-1.3     | Backend persistence     | P0       |
| TP-1.4     | Update config           | P1       |
| TP-1.5     | Missing fields          | P2       |
| TP-2.1     | Initiate call           | P0       |
| TP-2.2     | Execute call            | P0       |
| TP-2.3     | Post-call disposition   | P0       |
| TP-2.4     | No answer               | P1       |
| TP-2.5     | Cancel call             | P1       |
| TP-2.6     | Minimize/maximize       | P2       |
| TP-3.1     | Recording enabled       | P0       |
| TP-3.2     | Recording callback      | P0       |
| TP-3.3     | Recording disabled      | P1       |
| TP-4.1     | Navigate to call logs   | P0       |
| TP-4.2     | Data display            | P0       |
| TP-4.3     | Recording playback      | P0       |
| TP-4.4     | No recording display    | P1       |
| TP-4.5     | Inline note edit        | P1       |
| TP-4.6     | Ordering                | P1       |
| TP-4.7     | Empty state             | P2       |
| TP-5.1     | Inbound call            | P1       |
| TP-5.2     | Reject inbound          | P1       |
| TP-6.1     | Invalid credentials     | P2       |
| TP-6.2     | Webhook down            | P2       |
| TP-6.3     | Recording callback fail | P2       |
| TP-6.4     | Invalid number          | P1       |
| TP-6.5     | Concurrent calls        | P2       |
| TP-7.1–7.5 | API verification        | P0       |
