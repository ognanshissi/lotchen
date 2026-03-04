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

# Backend dev server
npm run api:start                  # npx nx run lotchen-api:serve

# Build frontend (production)
npm run build                      # npx nx run Lotchen:build:production

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
    contact/             Contacts + call logs
    activities/          Activity tracking
    dynamic-form/        Dynamic form engine
    leads/               Leads management
  api/
    core/                Shared backend utilities (guards, schemas, DTOs, base classes)
  lotchen/               Frontend feature libraries
    common/              Shared Angular services, guards, interceptors, components
    auth/                Login, forgot/reset password flows
    dashboard/           Dashboard feature
    prospects/           Contacts/prospects feature
    settings/            Settings feature
  shared/
    api/lotchen-client-api/  Auto-generated OpenAPI Angular HTTP client
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

## Known Architecture Issues

Before working in this codebase, be aware of these existing bugs/debts:

- **`paginate-all` pipeline**: `$skip` runs before `$sort` — pagination is non-deterministic
- **`update-contact`**: duplicate check uses `.id` on a `.lean()` result (always `undefined`) — updating a contact with its own email/phone always throws
- **`import-contacts-excel`**: `return new BadRequestException(...)` instead of `throw` — errors are silently returned as 200 responses
- **`ContactCreatedListener`**: `updateOne` filter uses `{ id }` instead of `{ _id }` — status history never writes; also opens a raw native driver connection that calls `db.close()` on error (closes the shared tenant connection)
- **`PatchDataCommand`**: uses `(contact as any)[fieldName]` — bypasses all schema validation; overlaps with `UpdateContactCommand`
- **`TenantMiddleware`**: tenant list is hardcoded — should be loaded from a master database
