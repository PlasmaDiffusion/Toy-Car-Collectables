# Database Options for Lasalle Collectibles — Production Notes

## Context

Lasalle Collectibles is a **commercial business** with the following profile:

- Low transaction volume (collectibles — probably < 200 orders/month at scale)
- Needs to be **legally licensed for commercial use**
- Prefers managed hosting (no self-managed servers)
- Dataset is small: ~100s of listings, 10s of categories, lightweight writes
- Must be reliable enough for a real storefront (uptime SLA matters)

This document compares the most realistic options across PostgreSQL, MongoDB, and AWS DynamoDB.

---

## TL;DR Recommendation

**Start on Neon free tier.** It is PostgreSQL 16, always-on (never pauses), commercially usable, and free until you grow. When you're ready to go fully public, upgrade to Neon's $19/month Launch plan or Supabase Pro ($25/month) for automated backups and an uptime SLA.

If you strongly prefer a document model, **MongoDB Atlas M0** is the free-forever equivalent for MongoDB, also commercially usable.

---

## Option 1 — Supabase (PostgreSQL)


| Property | Detail |
|---|---|
| Engine | PostgreSQL 15+ |
| License | Supabase platform: Apache 2.0 / MIT. PostgreSQL itself: PostgreSQL License. Both are **commercially usable with zero royalties.** |
| Free tier | 500 MB storage, 2 projects, 50,000 monthly active users, unlimited API calls, 7-day log retention |
| Free tier commercial use? | **Yes.** Supabase explicitly allows commercial projects on free tier. |
| Paid tier | $25/month Pro (8 GB DB, daily backups, no project pausing) |
| Reliability | Hosted on AWS; 99.9% SLA on Pro. **Free tier pauses after 1 week of inactivity and requires a manual admin "Restore" click in the dashboard to come back online — it does NOT auto-resume on incoming traffic.** Do not use the free tier for production. |
| Connection | Standard PostgreSQL connection string — drop it into `DATABASE_URL` |
| Extras | Built-in REST API (PostgREST), Auth, Storage, Realtime — useful if you add user accounts |

**Verdict:** Free tier is not safe for production — your storefront goes dark after a week of low traffic and won't recover until you manually restore it in the dashboard. Use the Pro plan ($25/month) if you want Supabase; otherwise start on Neon's free tier instead.

---

## Option 2 — Neon (Serverless PostgreSQL)

**Best overall pick for this project.**


| Property | Detail |
|---|---|
| Engine | PostgreSQL 16 |
| License | Neon's platform license permits commercial use. PostgreSQL License. |
| Free tier | 0.5 GB storage, 1 project, 10 branches, **always-on** (no pausing unlike Supabase free) |
| Free tier commercial use? | **Yes.** |
| Paid tier | $19/month Launch (10 GB, 1 compute) |
| Reliability | Serverless architecture — scales to zero, cold starts ~100–500ms. Fine for low traffic. |
| Connection | Standard PostgreSQL + `?sslmode=require` |
| Extras | Branching (great for staging/dev environments) |

**Verdict:** Neon's free tier doesn't pause, which gives it an edge over Supabase free for production. But the cold-start latency on first request can be noticeable.

---

## Option 3 — Railway (PostgreSQL)

| Property | Detail |
|---|---|
| Engine | PostgreSQL 15 |
| License | Commercial use permitted. |
| Free tier | $5 free credit/month (roughly covers a tiny Postgres instance for the month) |
| Paid tier | Usage-based: ~$5–10/month for a small DB at low traffic |
| Reliability | 99.9% uptime, hosted on GCP |
| Connection | Standard PostgreSQL string |
| Extras | Simple deploys — you can also host the Flask app itself on Railway |

**Verdict:** Not truly free, but cheap and simple. If you want to host both the Flask API and the database on the same platform for simplicity, Railway is the easiest all-in-one.

---

## Option 4 — Render (PostgreSQL)

| Property | Detail |
|---|---|
| Engine | PostgreSQL 14/15 |
| License | Commercial use permitted. |
| Free tier | 90-day free trial, then **expires and deletes data**. Not usable long-term for free. |
| Paid tier | $7/month (256 MB RAM, 1 GB storage) |
| Reliability | Good. Managed, automated backups on paid plans. |
| Extras | Can also host Flask on Render's free web service tier (spins down after inactivity) |

**Verdict:** Fine at $7/month but no meaningful free tier after the trial. Less compelling than Supabase or Neon for a bootstrapped launch.

---

## Option 5 — AWS RDS (PostgreSQL or MySQL)

| Property | Detail |
|---|---|
| Engine | PostgreSQL 15, MySQL 8, Aurora |
| License | Fully commercial, AWS standard terms. |
| Free tier | 12-month free tier: db.t3.micro, 20 GB SSD — **only free for the first year of a new AWS account** |
| Paid tier | db.t3.micro ~$15–18/month; db.t3.small ~$34/month. Add storage + I/O on top. |
| Reliability | Industry gold standard. Multi-AZ option for high availability. |
| Connection | Standard PostgreSQL or MySQL |
| Extras | Aurora Serverless v2 scales to zero, but minimum billing is ~$43/month even idle |

**Verdict:** Overkill for a low-volume collectibles shop unless you're already deep in AWS. After the free year you're paying $15–20/month for the smallest instance, which is more expensive than Supabase Pro with fewer extras. Consider it later if the business scales significantly or you need Aurora's performance.

---

## Option 6 — MongoDB Atlas

| Property | Detail |
|---|---|
| Engine | MongoDB 7 |
| License | Server Side Public License (SSPL) for self-hosted. **Atlas (hosted) is under a separate commercial agreement that permits commercial use.** |
| Free tier | M0 shared cluster: 512 MB storage, **free forever, no credit card required** |
| Free tier commercial use? | **Yes.** Atlas M0 is explicitly permitted for commercial applications. |
| Paid tier | M10 dedicated: ~$57/month |
| Reliability | M0 is shared (multi-tenant) — fine for low traffic, but no SLA. M10+ gets a dedicated SLA. |
| Connection | MongoDB URI; use `pymongo` or `mongoengine` (see commented requirements.txt) |
| Extras | Atlas Search (full-text), Charts, Data API |

**When to choose MongoDB over PostgreSQL:**
- Your car listings have highly variable or nested attributes (e.g., each brand stores completely different spec fields)
- You want schemaless flexibility to add new fields without migrations
- You're already familiar with document databases

**When NOT to use MongoDB:**
- Your data is relational (cars ↔ categories many-to-many) — joins are awkward in Mongo
- You want strong ACID transactions across multiple documents (Mongo 4+ supports them but it's not idiomatic)

**Verdict for this project:** PostgreSQL is the better fit because car ↔ category is a relational join. But MongoDB Atlas M0 is a legitimate free-forever option if you prefer the document model.

---

## Option 7 — AWS DynamoDB

| Property | Detail |
|---|---|
| Engine | DynamoDB (proprietary key-value / document store) |
| License | AWS commercial terms. Fully legal for commercial use. |
| Free tier | **Always-free tier (no expiry):** 25 GB storage, 25 read capacity units (RCU), 25 write capacity units (WCU) per month |
| Free tier commercial use? | **Yes.** AWS free tier is available to commercial accounts. |
| Paid tier | On-demand: ~$1.25/million reads, ~$1.25/million writes after free tier |
| Reliability | 99.999% SLA multi-region (Global Tables). Among the most reliable databases on the planet. |
| Connection | `boto3` Python SDK; no SQL |
| Extras | Streams, Global Tables, DAX (caching), Serverless-friendly |

**DynamoDB trade-offs:**
- The free tier is genuinely production-suitable for a low-volume shop — 25 RCU / 25 WCU handles thousands of reads/day with ease for this dataset size
- But DynamoDB is **not a relational database.** You must model your access patterns up front (single-table design). The car ↔ category relationship requires careful key design
- No SQL, no joins, no migrations — everything is key-value or index scans
- Great if you're building serverless Lambda functions; awkward with Flask + SQLAlchemy

**Verdict:** The always-free tier is attractive for a commercial business, but DynamoDB's programming model is a poor fit for the relational data here (cars/categories). Worth reconsidering if you rebuild as a serverless AWS Lambda + API Gateway stack.

---

## Option 8 — PlanetScale (MySQL-compatible)

| Property | Detail |
|---|---|
| Engine | Vitess (MySQL wire-compatible) |
| Free tier | **Eliminated in 2024.** PlanetScale killed its free tier in April 2024. |
| Paid tier | $39/month Scaler (minimum) |

**Verdict:** Used to be the best MySQL free tier. No longer. Skip it.

---

## Option 9 — CockroachDB Serverless

| Property | Detail |
|---|---|
| Engine | CockroachDB (PostgreSQL wire-compatible) |
| License | Business Source License (BSL) for self-hosted, but the **serverless cloud version is commercially usable** |
| Free tier | 10 GB storage, 50M RUs/month, no pausing |
| Free tier commercial use? | **Yes.** |
| Paid tier | $0.20/million RUs after free tier (pay-as-you-go) |
| Reliability | Distributed, automatic failover — extremely resilient |
| Connection | PostgreSQL string + `?sslmode=verify-full` |

**Verdict:** A solid PostgreSQL-compatible option with a generous free tier. The distributed architecture is overkill for a small shop, but it's genuinely free and commercial-ready. Good backup option if Supabase free tier doesn't work out.

---

## Summary Table

| Provider | Engine | Free Tier | Free Forever? | Commercial OK? | Paid Entry |
|---|---|---|---|---|---|
| **Neon** | PostgreSQL | 0.5 GB | Yes, no pause | Yes | $19/month |
| **Supabase** | PostgreSQL | 500 MB | Yes, but **manual unpause required** | Yes | $25/month |
| **Railway** | PostgreSQL | ~$5 credit | No (credit-based) | Yes | ~$5–10/month |
| **Render** | PostgreSQL | 90-day trial | No | Yes | $7/month |
| **AWS RDS** | PostgreSQL/MySQL | 1 year only | No | Yes | ~$15/month |
| **MongoDB Atlas** | MongoDB | 512 MB M0 | Yes | Yes | $57/month (M10) |
| **AWS DynamoDB** | Key-value | 25 GB forever | Yes | Yes | Pay-per-use |
| **PlanetScale** | MySQL | None | — | Yes | $39/month |
| **CockroachDB** | PostgreSQL | 10 GB | Yes | Yes | Pay-per-use |

---

## Recommended Progression

1. **Launch:** Neon free tier (PostgreSQL) — zero cost, always-on, no manual unpause required, standard connection string
2. **Go live publicly:** Upgrade to Neon Launch ($19/month) or Supabase Pro ($25/month) — both add automated daily backups and an uptime SLA
3. **If traffic grows significantly:** Migrate to AWS RDS db.t3.small (~$34/month) or Aurora Serverless for auto-scaling

The Flask + SQLAlchemy code in this repo works identically across all PostgreSQL-compatible options above — switching is just a `DATABASE_URL` change.


## 0Auth Linking With Google and Facebook logins

1 — Google OAuth (takes ~2 min)

Go to console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client
Authorised redirect URI: http://localhost:3000/api/auth/callback/google
Paste client_id and client_secret into .env.local
2 — Facebook OAuth (takes ~5 min)

Go to developers.facebook.com → Create App → Consumer
Add Facebook Login product → Valid OAuth Redirect: http://localhost:3000/api/auth/callback/facebook
Paste App ID and App Secret into .env.local
3 — Run the seed (to create the new users + wishlist_cars tables in Neon)