This is a site paired with a small business that sells vintage toy cars with facebook marketplace.

When a page is clicked it uses AR to preview what a car might look like on a person's shelf. It maps real photos onto a 3D box (a "photogrammetry lite" technique) as a way to give customers a rough idea of how it would fit on a shelf.

## Next.JS and Neon
This was made with Next.JS and Neon.

run with `npm run dev`

## Applying the database schema

Runs `db/schema.sql` against Neon — creates all tables, indexes, and enums. Safe to re-run; existing tables and types are skipped.

```zsh
export $(grep DATABASE_URL .env.local | head -1 | xargs) && psql "$DATABASE_URL" -f db/schema.sql 2>&1 | tail -30
```

> **Future schema changes:** append new `ALTER TABLE` statements to the bottom of `db/schema.sql` with a date comment (e.g. `-- 2026-06-01: add notes column`), then re-run the command above. Do not modify existing `CREATE TABLE` blocks for tables that already exist in production.

Be careful with `DROP COLUMN` or `DROP TABLE` statements!

# Other Notable Things About Neon

Neon has DB branching. Test any schema or database changes there via the staging branch, then apply it to the production branch.

Neon does not have a build in migration system. In the event this project greatly grew in complexity, look into hooking Neon up with Drizzle ORM.

## Seeding the database

Populates categories, cars, a test user, and wishlist data from `data/`.

```zsh
npx tsx db/seed.ts
```