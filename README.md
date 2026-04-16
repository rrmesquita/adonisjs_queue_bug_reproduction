# AdonisJS Queue Autodiscovery Reproduction

Minimal reproduction for a queue boot issue in `@adonisjs/queue`.

## Summary

When queue job autodiscovery is enabled via `locations` in `config/queue.ts`, unrelated Ace commands like `node ace migration:run` eagerly import jobs from `app/jobs`.

In this repo, the job at `app/jobs/check_user_job.ts` imports `app/models/user.ts`, which extends `UserSchema` from `#database/schema`.

After rolling back all migrations, `database/schema.ts` no longer exports `UserSchema`. Running `node ace migration:run` then causes queue autodiscovery to import the job before the migration regenerates the schema classes, producing a boot-time error.

## Versions

- `@adonisjs/core`: `^7.3.1`
- `@adonisjs/lucid`: `^22.4.2`
- `@adonisjs/queue`: `^0.6.0`
- `better-sqlite3`: `^12.9.0`

## Reproduction

Run:

```bash
node ace migration:rollback --batch=0
node ace migration:run
```

## Actual Result

During `migration:run`, queue boot imports the job too early and logs an error similar to:

```text
Failed to load job from app/jobs/check_user_job.ts: .../app/models/user.ts:1
import { UserSchema } from '#database/schema'
SyntaxError: The requested module '#database/schema' does not provide an export named 'UserSchema'
```

The migration still completes and regenerates `database/schema.ts`.

## Expected Result

Unrelated console commands like `migration:run` should not need every autodiscovered job to be importable before the command completes its own work.

## Notes

- This reproduces with SQLite, so it does not appear to be PostgreSQL-specific.
- If `locations` is commented out in `config/queue.ts`, the error does not happen.
- That suggests the issue is tied to eager queue job autodiscovery during unrelated console boot.
