# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lotchen is a SaaS CRM for microfinance and insurance, built as an **Nx monorepo** with:

- **Frontend**: Angular 18 (SSR with `@angular/ssr`), PrimeNG, Tailwind CSS
- **Backend**: NestJS 10, MongoDB/Mongoose, multi-tenant architecture
- **Node**: 22.x required

## Commands

```bash
# Frontend dev server
npm start                          # npx nx run Lotchen:serve:development

# Frontend SSR dev server
npm run ssr:dev

# Backend dev server
npm run api:start                  # npx nx run lotchen-api:serve

# Build frontend (production)
npm run build                      # npx nx run Lotchen:build:production

# Build & watch UI library during development
npm run ui:build
npm run ui:watch

# Run all tests
npx nx run-many --target=test

# Run tests for a single project
npx nx test lotchen-api
npx nx test lotchen-common         # e.g. for libs/lotchen/common

# Lint
npx nx lint <project-name>

# Generate OpenAPI client from backend spec
npm run openapi-generator

# Generate docs (Compodoc)
npm run doc

# Twilio voice webhook API
npm run start:voice-api
npm run build:voice-api:prod
```

## Monorepo Structure

```
apps/
  Lotchen/               Angular SSR frontend
  lotchen-api/           NestJS API entry point (AppModule)
  twilio-voice-webhook-api/  Twilio voice webhook service

libs/
  lotchen-api/           Backend feature libraries
    identity-provider/   Auth, users, roles, permissions, teams, agencies, territories
    contact/             Contacts + call logs + lead capture/qualify/convert/enrich
    activities/          Activity tracking
    calling/             Telephony config + token management
    campaigns/           Campaigns, messages, templates
    dynamic-form/        Dynamic form engine
    leads/               Leads management
    pipelines/           Pipelines, deals, analytics
    products/            Products + policies
    workflows/           Workflow templates, engine, executions
  api/
    core/                Shared backend utilities (guards, schemas, DTOs, base classes)
  lotchen/               Frontend feature libraries
    common/              Shared Angular services, guards, interceptors, components
    auth/                Login, forgot/reset password flows
    campaigns/           Campaign management
    clients/             Client/company management
    dashboard/           Dashboard feature
    events/              Event management
    leads/               Leads feature
    pipelines/           Pipeline/deal management
    prospects/           Contacts/prospects feature
    settings/            Settings feature
    workflows/           Workflow automation
  shared/
    api/lotchen-client-api/  Auto-generated OpenAPI Angular HTTP client
    ui/                      @talisoft/ui/* design system (secondary entry points)
```

## Backend Architecture

### Request Lifecycle

```
HTTP Request
  → TenantMiddleware    (reads x-tenant-fqdn header, injects tenant_fqdn on req)
  → AuthGuard           (validates JWT Bearer token, unless @Public())
  → Controller          (routes to handler)
  → CommandHandler / QueryHandler  (business logic)
  → Provider            (Mongoose model + current user context)
  → Mongoose (tenant-scoped connection via TENANT_CONNECTION token)
```

### Multi-tenancy

Every request must include `x-tenant-fqdn` header. `TenantMiddleware` resolves it to a database name. The `TENANT_CONNECTION` Mongoose connection is scoped per tenant — models are registered via factory providers that receive `tenantConnection`.

### CQRS-style Pattern

All business logic lives in handler classes, never in controllers.

| Base class                 | Use for                            |
| -------------------------- | ---------------------------------- |
| `CommandHandler<Cmd, Res>` | Mutations (create, update, delete) |
| `QueryHandler<Query, Res>` | Reads                              |
| `RequestHandler<Req, Res>` | Generic (used in auth)             |

**To add a new endpoint** (3 steps):

1. Create `libs/lotchen-api/<module>/src/<feature>/<action>/<name>.command.ts` — define input class + `@Injectable()` handler
2. Register the handler in `<module>.module.ts` → `providers: []` array
3. Inject handler in the controller constructor and add the route method

### Key shared abstractions (`libs/api/core`)

- `AggregateRoot` — base Mongoose document with UUID `_id` + audit fields (`createdBy`, `createdByInfo`, `updatedBy`, `deletedAt`)
- `CurrentUserProvider` — base injectable that exposes `user()` from the JWT payload on the request
- `BaseRepository<T>` — thin Mongoose wrapper (partially implemented; most handlers access the model directly via the Provider)
- `filterQueryGenerator(FilterDto)` — converts `{ operator, value }` filter DTO to a Mongoose query expression
- `@Public()` — marks a route as bypassing `AuthGuard`
- `@ApiPaginationResponse(Dto)` — Swagger decorator for paginated responses
- `TenantMiddleware` — resolves `x-tenant-fqdn` to a `tenant_fqdn` on the request object

### Provider pattern

Each feature module has a `XxxProvider` that extends `CurrentUserProvider` and holds the Mongoose model(s):

```typescript
@Injectable()
export class ContactProvider extends CurrentUserProvider {
  constructor(@Inject(CONTACT_MODEL) public readonly ContactModel: Model<ContactDocument>, @Inject(REQUEST) public override readonly request: RequestExtendedWithUser) {
    super(request);
  }
}
```

Handlers receive the Provider via DI and access `this.contactProvider.ContactModel` and `this.contactProvider.user()`.

## Frontend Architecture

### Angular Module / Library layout

Each feature in `libs/lotchen/<feature>` is a lazy-loaded Angular library. The main app (`apps/Lotchen`) only declares routes — all components live in libs.

### Routing

Routes are defined in `apps/Lotchen/src/app/app.routes.ts`. Protected routes use the `authorized` guard (`libs/lotchen/common/src/guards/authorized.guard.ts`), which calls `AuthenticationService.verifyToken()`.

### HTTP Client

`libs/shared/api/lotchen-client-api` is **auto-generated** by OpenAPI Generator — do not edit manually. To update it, modify the backend, regenerate the spec, then run `npm run openapi-generator`.

### Authentication flow

`AuthenticationService` (`libs/lotchen/common/src/services/authentication.service.ts`):

- Stores tokens in `localStorage` under key `LOTCHEN_ACCESS_TOKEN` as `AccessTokenResponse` JSON
- Exposes Angular signals: `connectedUser`, `accessToken`, `loadingUserInfo`, `errorMessage`
- `verifyToken()` calls `POST /api/v1/auth/verify-token` — used by the route guard

### UI Design System (`@talisoft/ui`)

All shared UI components live in `libs/shared/ui/` and are exposed as **secondary ng-packagr entry points**. The path alias `@talisoft/ui/*` maps directly to `libs/shared/ui/*`, so a component at `libs/shared/ui/button/` is imported as `@talisoft/ui/button`.

**Component anatomy** — every component follows this layout:

```
libs/shared/ui/<name>/
  index.ts              → export * from './src/public_api'
  ng-package.json       → {} (empty, marks secondary entry point)
  src/
    <name>.ts           → component class
    <name>.html         → template (if not inline)
    <name>.scss         → styles (if not inline)
    public_api.ts       → export * from './<name>'
```

**Component conventions:**

- Always `standalone: true`, `ViewEncapsulation.None`, `ChangeDetectionStrategy.OnPush`
- Styles go on the host element selector (e.g. `tas-button { @apply ... }`)
- Use Angular signals (`signal`, `computed`, `input`, `output`) — not `@Input()`/`@Output()` decorators
- Tailwind color tokens in use: `primary`, `accent`, `warn`, `functional-error`, `functional-success`
- CSS variable for primary color: `rgb(var(--tas-color-primary) / <opacity>)`

**Form control components** extend `AbstractControlValueAccessor<T>` from `@talisoft/ui/core`:

```typescript
export class TasMyControl extends AbstractControlValueAccessor<string> {
  // override value getter/setter to use a signal for reactivity:
  private _val = signal<string>('');
  override get value() {
    return this._val();
  }
  override set value(v: string) {
    this._val.set(v);
    this.onTouched();
    this.onChange(v);
  }
}
```

Provide `NG_VALUE_ACCESSOR` with `forwardRef` (do **not** rely on the parent class provider — it references the abstract class, not the concrete one).

**Available components** (import path → selector):
`@talisoft/ui/button` → `button[tas-raised-button]`, `button[tas-outlined-button]`
`@talisoft/ui/icon` → `<tas-icon iconName="feather:name">`
`@talisoft/ui/side-drawer` → `<tas-side-drawer>`, `<tas-drawer-title>`, `<tas-drawer-content>`, `<tas-drawer-action>`, `TasClosableDrawer`
`@talisoft/ui/card` → `<tas-card>`
`@talisoft/ui/alert` → `<tas-alert type="success|error|info">`
`@talisoft/ui/form-field` → `<tas-form-field>`, `<tas-label>`, `TasPrefix`, `TasSuffix`
`@talisoft/ui/input` → `input[tasInput][type=text|email|…]`
`@talisoft/ui/input-email` → email-specific input
`@talisoft/ui/input-password` → password input with toggle
`@talisoft/ui/select` → `<tas-select>`
`@talisoft/ui/multi-select` → `<tas-multi-select>`
`@talisoft/ui/checkbox` → `<tas-checkbox>`
`@talisoft/ui/date-picker` → `<tas-date-picker>` (modes: `date|time|datetime|daterange`)
`@talisoft/ui/file-uploader` → `<tas-file-uploader accept=".xlsx">` (ControlValueAccessor, `File | null`)
`@talisoft/ui/table` → `<tas-table>`
`@talisoft/ui/menu` → `<tas-menu>`
`@talisoft/ui/tag` → `<tas-tag>`
`@talisoft/ui/spinner` → `<tas-spinner>`
`@talisoft/ui/snackbar` → snackbar notifications
`@talisoft/ui/confirm-dialog` → confirmation dialogs
`@talisoft/ui/navigation` → navigation components
`@talisoft/ui/layouts` → layout components
`@talisoft/ui/container` → `<tas-container>`
`@talisoft/ui/title` → `<tas-title>`
`@talisoft/ui/text` → `<tas-text>`
`@talisoft/ui/summary-data` → summary display
`@talisoft/ui/summary-field` → summary field display
`@talisoft/ui/timeago` → relative time display
`@talisoft/ui/currency-pipe` → currency formatting pipe

## Known Architecture Issues

Before working in this codebase, be aware of these existing bugs/debts:

- **`paginate-all` pipeline**: `$skip` runs before `$sort` — pagination is non-deterministic
- **`update-contact`**: duplicate check uses `.id` on a `.lean()` result (always `undefined`) — updating a contact with its own email/phone always throws
- **`import-contacts-excel`**: `return new BadRequestException(...)` instead of `throw` — errors are silently returned as 200 responses
- **`ContactCreatedListener`**: `updateOne` filter uses `{ id }` instead of `{ _id }` — status history never writes; also opens a raw native driver connection that calls `db.close()` on error (closes the shared tenant connection)
- **`PatchDataCommand`**: uses `(contact as any)[fieldName]` — bypasses all schema validation; overlaps with `UpdateContactCommand`
- **`TenantMiddleware`**: tenant list is hardcoded — should be loaded from a master database
