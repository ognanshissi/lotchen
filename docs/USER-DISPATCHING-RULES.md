# CRM Dispatching Rule Definition - User Stories

## Epic: Dispatching Rule Management

**As a CRM administrator, I want to define and manage dispatching rules so that leads, cases, tickets, and service requests are automatically assigned to the appropriate agents or teams.**

---

# Story 1: Create a Dispatching Rule

### User Story

As a CRM administrator, I want to create a dispatching rule so that records are automatically routed based on business criteria.

### Frontend Actions

- Access "Dispatching Rules" configuration page.
- Click "Create Rule".
- Enter:
  - Rule name
  - Description
  - Status (Draft/Active)
  - Object type (Lead, Case, Ticket, etc.)
- Save draft.

### Backend Actions

- Validate required fields.
- Create rule record.
- Generate unique rule identifier.
- Store rule metadata.
- Audit log creation event.

### Acceptance Criteria

- Rule can be saved as draft.
- Unique identifier is generated.
- Validation errors displayed for missing fields.

---

# Story 2: Define Rule Conditions

### User Story

As a CRM administrator, I want to define conditions that trigger a dispatching rule.

### Frontend Actions

- Add one or more conditions.
- Select:
  - Field
  - Operator (=, !=, >, <, Contains)
  - Value
- Group conditions with AND/OR logic.
- Preview condition expression.

### Backend Actions

- Validate field existence.
- Validate operator compatibility.
- Store condition tree structure.
- Serialize rule expression.

### Acceptance Criteria

- Multiple conditions can be configured.
- Nested condition groups supported.
- Invalid expressions cannot be saved.

---

# Story 3: Configure Assignment Targets

### User Story

As a CRM administrator, I want to define assignment targets so that records are routed correctly.

### Frontend Actions

- Select:
  - Individual agent
  - Team
  - Queue
  - Department
- Search and browse available targets.
- Configure fallback target.

### Backend Actions

- Retrieve eligible targets.
- Validate target existence.
- Store target mappings.

### Acceptance Criteria

- Target list displays active entities only.
- Fallback target is optional but supported.

---

# Story 4: Configure Routing Strategy

### User Story

As a CRM administrator, I want to select a routing strategy so that work is distributed appropriately.

### Frontend Actions

Select routing method:

- Round Robin
- Least Loaded
- Skill Based
- Territory Based
- First Available
- Custom Score

Configure strategy-specific parameters.

### Backend Actions

- Store routing strategy.
- Validate strategy parameters.
- Register strategy with routing engine.

### Acceptance Criteria

- Strategy-specific fields appear dynamically.
- Unsupported configurations are rejected.

---

# Story 5: Define Agent Capacity Rules

### User Story

As a CRM administrator, I want to configure capacity limits so that agents are not overloaded.

### Frontend Actions

Configure:

- Max open tickets
- Max daily assignments
- Concurrent workload threshold

### Backend Actions

- Store capacity settings.
- Expose settings to routing engine.
- Calculate current workload metrics.

### Acceptance Criteria

- Capacity thresholds are enforced during dispatch.

---

# Story 6: Configure Agent Availability

### User Story

As a CRM administrator, I want dispatching to consider agent availability.

### Frontend Actions

Configure:

- Business hours
- Time zones
- Leave periods
- Availability status integration

### Backend Actions

- Retrieve availability information.
- Exclude unavailable agents from assignment calculations.

### Acceptance Criteria

- Unavailable agents do not receive assignments.

---

# Story 7: Define Escalation Rules

### User Story

As a CRM administrator, I want records to escalate automatically when SLAs are at risk.

### Frontend Actions

Configure:

- Escalation trigger
- Escalation delay
- Escalation target
- Notification settings

### Backend Actions

- Create escalation timers.
- Monitor SLA thresholds.
- Trigger reassignment or notification.

### Acceptance Criteria

- Escalation occurs automatically when conditions are met.

---

# Story 8: Configure Rule Priority

### User Story

As a CRM administrator, I want to prioritize rules so that conflicts are resolved consistently.

### Frontend Actions

- Set rule priority value.
- Reorder rules using drag-and-drop.
- View execution sequence.

### Backend Actions

- Store execution order.
- Resolve overlapping rule matches.

### Acceptance Criteria

- Highest-priority matching rule is executed.

---

# Story 9: Test Dispatching Rules

### User Story

As a CRM administrator, I want to simulate rule execution before activation.

### Frontend Actions

- Enter sample record data.
- Run simulation.
- View matched rule.
- View assigned target.

### Backend Actions

- Execute rule engine in simulation mode.
- Return matching path and assignment result.

### Acceptance Criteria

- Simulation does not create actual assignments.
- Matching logic is fully explained.

---

# Story 10: Activate and Deactivate Rules

### User Story

As a CRM administrator, I want to control rule activation so that routing behavior can be managed safely.

### Frontend Actions

- Activate rule.
- Deactivate rule.
- View status indicators.

### Backend Actions

- Update rule state.
- Refresh routing engine cache.
- Log activation changes.

### Acceptance Criteria

- Only active rules are evaluated.

---

# Story 11: View Assignment Audit Trail

### User Story

As a supervisor, I want to see how a dispatch decision was made.

### Frontend Actions

- Open assignment history.
- View:
  - Matched rule
  - Conditions evaluated
  - Selected target
  - Timestamp

### Backend Actions

- Persist routing decisions.
- Expose audit API.

### Acceptance Criteria

- Every assignment decision is traceable.

---

# Story 12: Monitor Rule Performance

### User Story

As a supervisor, I want to analyze dispatch performance so that routing can be optimized.

### Frontend Actions

Dashboard showing:

- Assignment volume
- Average assignment time
- Escalation rate
- SLA compliance
- Agent workload distribution

### Backend Actions

- Aggregate assignment metrics.
- Generate reporting datasets.

### Acceptance Criteria

- Metrics are available by rule and time period.

---

# Story 13: Manage Rule Versions

### User Story

As a CRM administrator, I want version control for dispatching rules so that changes can be tracked and reverted.

### Frontend Actions

- View version history.
- Compare versions.
- Restore previous version.

### Backend Actions

- Persist rule versions.
- Support rollback operations.

### Acceptance Criteria

- Previous versions remain accessible after updates.

---

# Core Backend APIs

- `POST /dispatch-rules`
- `PUT /dispatch-rules/{id}`
- `GET /dispatch-rules`
- `GET /dispatch-rules/{id}`
- `DELETE /dispatch-rules/{id}`
- `POST /dispatch-rules/{id}/activate`
- `POST /dispatch-rules/{id}/deactivate`
- `POST /dispatch-rules/simulate`
- `GET /dispatch-rules/{id}/audit`
- `GET /dispatch-rules/{id}/metrics`

## Lifecycle

Rule Creation → Condition Definition → Routing Logic → Capacity & Availability → Testing → Activation → Monitoring → Audit & Governance
