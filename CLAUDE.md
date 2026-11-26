# CLAUDE.md

NestJS 10 + TypeORM + PostgreSQL backend for a personal finance app: users, accounts (cash / bank), income/expense transactions, categories, and period reports.

Full API reference (routes, bodies, responses) and the known-issues list: `docs/FEATURES.md`. Read it when a task touches endpoints; keep it updated when you add or change one.

## Commands

- `npm run start:dev` — run with watch, port `PORT` or 3000
- `npm run test` — unit tests (Jest, `src/**/*.spec.ts`)
- `npm run test:e2e` — e2e tests (`test/`)
- `npm run lint` / `npm run format`

Local DB: Postgres on `localhost:5432`, database `FinwiseBackend` (configured in `src/app.module.ts`).

## Structure and conventions

- One module per feature in `src/<feature>/`: controller (routes, guards, validation) → service (business rules) → repository (queries). Keep DB access in repositories.
- DTOs are **Zod schemas** in `dto/create-*.dto.ts`, with types from `z.infer`. Validate with the custom `ValidationPipe` from `src/Utilities/validation.pipe.ts`: `@Body(new ValidationPipe(Schema))`. Do not use class-validator or Nest's built-in `ValidationPipe`.
- User-owned routes use `@UseGuards(Authorize)` and read the caller with `@User('userId')`. Always scope queries by `userId` (directly or through `account.userId`).
- New modules must be imported in `src/app.module.ts`; entities load automatically (`autoLoadEntities`).
- Import with relative paths (`../Utilities/...`), not `src/...`: the Vercel build in `api/index.ts` doesn't resolve `src/` paths.

## Rules that are easy to miss

- **Account balances are derived from transactions.** Any create/update/delete of a transaction must adjust `account.balance` inside `this.dataSource.transaction(...)`, as `TransactionService` does: reverse the old effect, apply the new one.
- Reports and date filters use the **`Africa/Cairo`** time zone (`AT TIME ZONE 'Africa/Cairo'` in SQL). Keep new date logic consistent with that.
- `synchronize: true` is on: editing an entity changes the schema on the next start and can drop columns. Be careful with renames.
- Summary endpoints in `transaction.repository.ts` are raw SQL; check that every join is filtered by `userId`.
- Static routes like `/transaction/period` must be declared before `/:id` in controllers.
- Tokens: access token expires in 1 min (`JWT_SECRET`), refresh token in 5 min (`JWT_REFRESH_SECRET`); refresh tokens are stored in `refresh_tokens`.

## Not in use

`src/product/` is a scaffold that isn't registered. `Logger.ts`, `HttpExceptionFilter.ts`, `Configuration.ts`, `DatabaseConfig.ts` and `@Roles()` aren't wired up. Don't build on them without checking with the user.
