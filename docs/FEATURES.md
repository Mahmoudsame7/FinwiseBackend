# Backend Features

A NestJS + TypeORM (PostgreSQL) backend for a personal finance app ("FinwiseBackend"). Users sign up, log in with JWTs, hold money accounts (cash / bank), and record income and expense transactions grouped by category. The server keeps account balances in sync with transactions and produces period summaries for charts.

- [Architecture](#architecture)
- [Data model](#data-model)
- [1. Users and registration](#1-users-and-registration)
- [2. Login and JWT authentication](#2-login-and-jwt-authentication)
- [3. Accounts](#3-accounts)
- [4. Categories](#4-categories)
- [5. Transactions](#5-transactions)
- [6. Reports and summaries](#6-reports-and-summaries)
- [7. Search and filtered listing](#7-search-and-filtered-listing)
- [8. SMS transaction parsing (in progress)](#8-sms-transaction-parsing-in-progress)
- [9. Shared utilities](#9-shared-utilities)
- [10. Deployment](#10-deployment)
- [Known issues](#known-issues)

---

## Architecture

Each feature is a Nest module under `src/` with the same layers:

| Layer | Role |
|---|---|
| `*.controller.ts` | HTTP routes, guards, request validation |
| `*.service.ts` | Business rules (ownership checks, balance updates, hashing) |
| `*.repository.ts` | Database queries (TypeORM repository / query builder / raw SQL) |
| `dto/*.dto.ts` | Zod schemas and inferred TypeScript types for request bodies |
| `entities/*.entity.ts` | TypeORM table definitions |

Modules registered in [app.module.ts](../src/app.module.ts): `UsersModule`, `LoginModule`, `AccountModule`, `RefreshTokenModule`, `TransactionModule`, `CategoryModule`. The database connection uses `autoLoadEntities` and `synchronize: true`, so tables are created/altered from the entities on startup.

Request validation uses a custom Zod-based [ValidationPipe](../src/Utilities/validation.pipe.ts) (not Nest's class-validator pipe). Invalid input returns `400 Validation failed`.

All dates in reports are bucketed in the **`Africa/Cairo`** time zone.

## Data model

```
User 1 ──── * Account 1 ──── * Transaction * ──── 1 Category
```

| Table | Key columns |
|---|---|
| `users` | `id` (uuid), `email` (unique), `password` (bcrypt hash), `firstName`, `lastName`, `mobileNumber`, `dateOfBirth` |
| `accounts` | `id`, `userId` → users (cascade delete), `name`, `type` (`cash` \| `bank_account`), `initial_Balance`, `balance` |
| `transactions` | `id`, `accountId` → accounts (cascade delete), `type` (`income` \| `expense`), `title`, `amount`, `note`, `categoryId` → categories (restrict delete), `transactionTime` (timestamptz) |
| `catgories` | `id`, `title` (categories are global, not per user) |
| `refresh_tokens` | `id`, `userId`, `refreshToken`, `expiresAt` |

Every table also has `createdAt` / `updatedAt`.

---

## 1. Users and registration

Files: [src/user/](../src/user/)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/users` | none | Register a new user |
| `GET` | `/users/:id` | none | Get a user by id |
| `PATCH` | `/users/:id` | none | Update a user |

**Register** — body validated by `createUserSchema`:

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "valid email",
  "password": "min 8 chars",
  "mobileNumber": "E.164, e.g. +201001234567",
  "dateOfBirth": "date string"
}
```

Behavior:
- Rejects a duplicate email with `409 Email already exists`.
- Lowercases the email and hashes the password with bcrypt (cost 12).
- Logs the user in immediately: returns `{ user, accessToken, refreshToken }` and stores the refresh token.

**Update** — any subset of the register fields. Checks the new email is not taken and re-hashes a new password. Returns `404` if the user does not exist.

## 2. Login and JWT authentication

Files: [src/login/](../src/login/), [src/refresh-token/](../src/refresh-token/), [src/auth/auth.module.ts](../src/auth/auth.module.ts), [src/Utilities/Guards/](../src/Utilities/Guards/)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | none | Log in with email + password |
| `POST` | `/login/refresh-token` | refresh token in body | Get a new access/refresh token pair |

**Login** — body `{ "email": "...", "password": "..." }`. Looks up the user by lowercase email, compares with bcrypt, and returns `{ user, accessToken, refreshToken }`. Wrong email or password both return `404 Invalid credentials`.

**Tokens**

| Token | Secret (env var, fallback) | Lifetime | Payload |
|---|---|---|---|
| Access | `JWT_SECRET` (`defaultSecretKey`) | 1 minute | `{ userId, email }` |
| Refresh | `JWT_REFRESH_SECRET` (`defaultRefreshSecretKey`) | 5 minutes | `{ userId, email }` |

Each refresh token issued is saved in `refresh_tokens` with its expiry.

**Refresh** — body `{ "refreshToken": "..." }`. The `Refresh` guard verifies the JWT signature, then the service checks the user still exists and the token exists in the database and has not expired. Returns a new `{ accessToken, refreshToken }`. Old refresh tokens are not revoked.

**Protecting routes** — the `Authorize` guard reads `Authorization: Bearer <accessToken>`, verifies it, and puts the payload on `request.user`. Controllers read the caller with the `@User('userId')` decorator ([user.decorator.ts](../src/Utilities/user.decorator.ts)). A missing header returns `403`; an invalid/expired token returns `401`.

## 3. Accounts

Files: [src/account/](../src/account/) — all routes require `Authorization: Bearer <accessToken>`.

| Method | Route | Description |
|---|---|---|
| `POST` | `/account` | Create an account for the caller |
| `GET` | `/account` | List the caller's accounts |
| `GET` | `/account/summary` | Dashboard totals (see below) |
| `GET` | `/account/:id` | Get one of the caller's accounts |
| `PATCH` | `/account/:id` | Update one of the caller's accounts |
| `DELETE` | `/account/:id` | Delete an account (its transactions are cascade-deleted) |

**Create** body (`CreateAccountSchema`); `PATCH` accepts any subset:

```json
{
  "name": "string",
  "type": "cash | bank_account",
  "initialBalance": 0,
  "balance": 0
}
```

Every read/update/delete is scoped to the caller's `userId`, so users cannot see or change other users' accounts.

**Summary** (`GET /account/summary`) returns:

```json
{
  "totalBalance": 0,     // sum of balance across all the user's accounts
  "totalExpense": 0,     // sum of all expense transactions
  "totalIncome": 0,      // sum of all income transactions
  "lastWeekIncome": 0    // income in the 7 days before today (today excluded)
}
```

## 4. Categories

Files: [src/category/](../src/category/) — no authentication; categories are shared by all users.

| Method | Route | Description |
|---|---|---|
| `POST` | `/category` | Create a category — body `{ "title": "string" }` |
| `GET` | `/category` | List all categories |
| `GET` | `/category/:id` | Get a category (`404` if missing) |
| `PATCH` | `/category/:id` | Rename a category |
| `DELETE` | `/category/:id` | Delete a category (blocked by the DB if transactions use it) |

## 5. Transactions

Files: [src/transaction/](../src/transaction/) — all routes require a bearer token.

| Method | Route | Description |
|---|---|---|
| `POST` | `/transaction` | Create a transaction and update the account balance |
| `GET` | `/transaction` | List all the caller's transactions, or `?accountId=` for one account |
| `GET` | `/transaction/:id` | Get one transaction (with its account) |
| `PATCH` | `/transaction/:id` | Edit a transaction and rebalance accounts |
| `DELETE` | `/transaction/:id` | Delete a transaction and reverse its balance effect |

**Create** body (`CreateTransactionSchema`):

```json
{
  "accountId": "uuid",
  "title": "string",
  "amount": 100,                       // positive
  "type": "income | expense",
  "categoryId": "uuid",
  "note": "optional string",
  "transactionTime": "ISO date-time"
}
```

**Balance bookkeeping** — create, update and delete each run inside one database transaction, so the balance and the transaction row change together or not at all:

- **Create:** verifies the account belongs to the caller, then adds `amount` to the balance for income or subtracts it for expense.
- **Update:** reverses the old amount/type on the old account, then applies the new amount/type to the new account. Moving a transaction to another account is supported; the target account must also belong to the caller.
- **Delete:** reverses the transaction's effect on its account, then deletes the row.

## 6. Reports and summaries

All require a bearer token and return rows from raw PostgreSQL queries. Each row has `total`, `total_income`, `total_expense`, plus `period_total_income` and `period_total_expense` (the totals across every row of the response, repeated on each row). Empty buckets are returned with `0` so charts have no gaps.

| Route | Buckets | Extra fields per row |
|---|---|---|
| `GET /transaction/week-summary` | Last 7 days including today, newest first | `date`, `day` (e.g. `Monday`), `month` |
| `GET /transaction/month-summary` | 7-day chunks of the current month, starting on the 1st | `week_start`, `week_end`, `week_name` (`Week 1`…) |
| `GET /transaction/year-summary` | 12 months of the current year | `month_start`, `month_end`, `month_name` |
| `GET /transaction/all-summary` | One row per year that has transactions | `year` |

## 7. Search and filtered listing

**Filter by period** — `GET /transaction/period` (query string, `GetTransactionsSchema`):

| Param | Values |
|---|---|
| `period` | `daily` (today), `weekly` (last 7 days incl. today), `monthly` (current calendar month). Omit for all time. |
| `accountId`, `categoryId`, `type` | Optional filters |
| `page`, `limit` | Defaults `1` / `20`, max limit `100` |

Each item includes its `account`, `category`, plus computed `year` and `month` (Cairo time).

**Search** — `POST /transaction/search` (JSON body, `SearchTransactionsSchema`):

| Field | Meaning |
|---|---|
| `searchTerm` | Case-insensitive substring match on `title` |
| `date` | `YYYY-MM-DD`, matched against the Cairo calendar date |
| `accountId`, `categoryId`, `type` | Optional filters |
| `page`, `limit` | Defaults `1` / `20`, max `100` |

Both return results newest first with this envelope:

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 57, "totalPages": 3, "hasNextPage": true }
}
```

## 8. SMS transaction parsing (in progress)

`POST /transaction/sms` with body `{ "message": "<bank SMS text>" }` (bearer token required).

The service forwards the text to a local parsing service at `http://127.0.0.1:8000/parse` (body `{ "text": ... }`) and logs the prediction. It does **not** yet create a transaction or return the prediction — the endpoint currently responds with an empty body. If the parser is unreachable it returns `500 Failed to process SMS message`.

An earlier version that called Google Gemini directly (Arabic/English bank SMS → `amount`, `transactionTime`, `type`) is left commented out in [transaction.service.ts](../src/transaction/transaction.service.ts).

## 9. Shared utilities

Under [src/Utilities/](../src/Utilities/):

| File | Purpose | In use |
|---|---|---|
| `validation.pipe.ts` | Zod schema validation pipe | Yes |
| `Guards/authorize.guard.ts` | Access-token guard | Yes |
| `Guards/refresh.guard.ts` | Refresh-token guard | Yes |
| `user.decorator.ts` | `@User()` / `@User('userId')` param decorator | Yes |
| `Helpers/HelperFunctions.ts` | `getPeriodDates()` for daily/weekly/monthly ranges | Yes |
| `LoggingInterceptor.ts` | Logs request duration | Only on `ProductController` |
| `RoleDecorator.ts` | `@Roles()` metadata | Declared, never enforced |
| `Logger.ts`, `HttpExceptionFilter.ts`, `Configuration.ts`, `DatabaseConfig.ts` | Middleware, error filter, config loaders | Not wired up |

`GET /` returns a debug echo of the request (body, params, query, headers, IP, host).

The `product` module is a Nest learning scaffold (returns placeholder strings) and is **not** registered in `AppModule`, so its routes are not served.

## 10. Deployment

- **Local:** `npm run start:dev`, listens on `PORT` or `3000`. Connects to Postgres at `localhost:5432`, database `FinwiseBackend`.
- **Vercel:** [vercel.json](../vercel.json) routes every request to [api/index.ts](../api/index.ts), which boots the Nest app once per cold start on an Express adapter with CORS enabled.
- `src/app.datasource.ts` is a TypeORM CLI data source for migrations (`src/migrations/`); no migrations exist yet.

Environment variables read: `PORT`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL` (Vercel log only; the commented-out production DB config uses it).

---

## Known issues

Found while documenting; none of these were changed.

**Security**
- The Postgres password is hard-coded in [app.module.ts](../src/app.module.ts), and a Google GenAI API key sits in a comment in [transaction.service.ts](../src/transaction/transaction.service.ts). Both should move to env vars, and the API key should be rotated since it is in git history.
- JWT secrets fall back to well-known defaults if the env vars are unset.
- `GET /users/:id` and `PATCH /users/:id` have no auth guard — anyone can read or change any user. Login, registration and `GET /users/:id` responses include the bcrypt password hash.
- `POST /refresh-token` (the `RefreshTokenController`) is unauthenticated and lets anyone insert rows into `refresh_tokens`.
- Category routes have no auth.
- `/login` body validation is commented out.

**Correctness**
- `GET /transaction/month-summary` joins transactions by date before filtering by user, so its totals include **every user's** transactions.
- `AccountService.update` / `remove` `return` a `NotFoundException` instead of throwing it, so a missing account responds `200` with an error object.
- `CreateTransactionSchema` marks every field optional/nullable, but `title`, `amount`, `type`, `categoryId`, `transactionTime` and `accountId` are required by the database, so bad input surfaces as a `500` instead of a `400`.
- `RefreshToken.userId` is declared with `@PrimaryGeneratedColumn`, making it part of a composite primary key.
- `LoginService.refreshToken` reads `storedRefreshToken.expiresAt` in a `console.log` before the null check, so an unknown token causes a `500`.
- `POST /transaction/sms` never returns a response body.
- `synchronize: true` can drop or alter columns in production; migrations are safer.
