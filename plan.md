# Applicant Rights Tool (working title)

## What it is
A free, no-login web tool that helps job applicants in Norway send GDPR
Article 15 + 22 requests after an auto-rejection, and walks them through
the escalation ladder if the employer ignores them.

## The core insight
Generating the request *text* is a commodity — ChatGPT does it free. The
value is NOT the text. The value is the stuff an LLM chat can't do:
- knowing WHO to send it to (correct DPO/privacy email, not the ATS relay)
- knowing WHICH identifying fields to include
- remembering the case over time (the 1-month clock)
- telling the user what to do next when ignored (reminder → Datatilsynet)

So: the words are the commodity; the state and the follow-through are the product.

## Scope decision (important)
There are two possible builds. Do NOT start with the second.

### v1 — stateless probe (THIS weekend)
- No accounts, no backend, no stored user data.
- Everything runs client-side. User fills a form, tool generates the
  filled request, user copies it into their own email client and sends.
- Zero cost, zero GDPR-controller liability (ironic to become one).
- Purpose: test whether anyone actually uses it. Cheap to throw away.

### v2 — stateful tracker (ONLY if v1 gets real usage)
- Accounts + storage → dashboard of multiple applications, each with its
  own 30-day countdown, escalation state, stored sent-dates/references.
- This is the part that justifies existing AND the part that could charge money.
- BUT: storing other people's application data makes YOU a data controller
  with GDPR obligations. Don't take that on for a hunch. Build only on demand signal.
- Response scorecard per company (see "v2 — response scorecard" below).

## v1 feature list
1. Find the employer — two entry points:
   a. Sender-address lookup: user pastes the "From" address of the rejection
      email (e.g. `hege.lindow@synoptikgroupnorway.teamtailor-mail.com`) and
      the tool resolves it to the company (see "Sender-address lookup" below)
   b. Company picker / search (curated list — see "the moat" below) as fallback
2. Short form for identifying fields:
   - Full name (as in application)
   - Email used in the application (may differ from sender)
   - Phone
   - Position title + store/location
   - Application date + rejection date
   - Reference/case number from rejection email (optional)
3. Generates the filled Article 15 + 22 request in Norwegian (+ English toggle)
4. Shows the CORRECT recipient address for the chosen company
5. Copy-to-clipboard; user sends from their own email
6. Short plain-language explainer: what Art 15 / Art 22 are, the 1-month
   deadline, that silence = a breach they can escalate
7. Tip jar (Ko-fi / Vipps link) — voluntary, no paywall, no payment processor
   contract, no tax headache at low volume
8. One static page per company (see "Per-company pages" below)

## The moat: the company → DPO-email lookup table
- The single highest-friction step for users is "where do I even send this?"
- The rejection comes from an ATS relay (e.g. `...@company.teamtailor-mail.com`)
  which is a dead end. The real recipient is the data controller's DPO /
  privacy address, found in their personvernerklæring.
- CANNOT be auto-scraped reliably: privacy emails are often obfuscated
  (e.g. Cloudflare email protection renders `[email protected]` to scrapers).
- Therefore the table must be MANUALLY VERIFIED, human-in-the-loop.
  That tedium is exactly why it's valuable — nobody else wants to do it.
- MVP: don't boil the ocean. Do the 15–20 employers students in Telemark
  actually apply to (grocery chains, fast food, Brilleland/Synsam, big retail).
  Let users submit corrections.

### Worked example (real, verified)
- Employer brand: Brilleland
- Data controller: Synoptik Norge AS, org.nr 936 314 783,
  Eyvind Lyches vei 19A, 1338 Sandvika
- ATS: Teamtailor (rejection came from a teamtailor-mail.com relay — do NOT use)
- Correct recipient: personvernombud@brilleland.no
- Datatilsynet (for escalation): postkasse@datatilsynet.no,
  Postboks 458 Sentrum, 0105 Oslo

## Sender-address lookup
- The rejection's sender address is the one thing every user already has.
  Its domain usually encodes both the ATS and the employer:
  `<person>@<company-slug>.<ats-mail-domain>`
  e.g. `synoptikgroupnorway` + `teamtailor-mail.com` → Brilleland.
- Lookup is two-level:
  1. Domain → ATS (Teamtailor, Webcruiter, ReachMee, Jobylon, Workday, ...)
  2. ATS + subdomain/slug → company entry in the table
- Parse client-side only; ignore the local part. The person's name before
  the `@` (e.g. a recruiter's) is personal data we have no use for — never
  store or log it.
- Unknown sender, known ATS → explain "this is Teamtailor, a data processor
  acting for the employer, not the right recipient", then fall back to the
  company picker + a "report this sender" link.
- Unknown everything → company picker.
- Table entries carry a list of known sender slugs per ATS, so one company
  can match several relays (brands, regions, ATS migrations).

## Per-company pages
- One static, indexable page per company, e.g.
  "Slik ber du om innsyn hos Brilleland":
  verified recipient address, data controller (name, org.nr, address),
  which ATS they use, "last verified" date + source link to their
  personvernerklæring, and a button into the request flow with the
  company preselected.
- Generated at build time from the company table — no backend.
- This is the awareness channel: the pages are what a rejected applicant
  googles, so the moat (the table) doubles as discovery.

## Company table — data shape & sourcing
Per entry: brand name(s), data controller legal name, org.nr, postal
address, privacy recipient email, ATS + known sender slugs, career-site
URL, source URL (personvernerklæring), last-verified date.

Finding ATS + sender info WITHOUT applying to every job:
- Career page / finn.no "Søk her" link: the apply URL reveals the ATS and
  usually the company slug (e.g. `<slug>.teamtailor.com`,
  `webcruiter.no/...`, `<slug>.jobylon.com`, `*.myworkdayjobs.com`).
- Hypothesis to verify: the career-site slug matches the mail-relay
  slug for the same ATS. Check against the Brilleland data point before
  relying on it; check each ATS separately.
- Privacy policy: often names the ATS as a data processor (databehandler).
- Crowdsourcing: users report unknown senders via mailto / GitHub issue
  (domain only — keeps v1 stateless). Real rejections are the ground truth.
- Ask friends / USN students to share the sender domain of rejections
  they already have in their inbox.
- Brønnøysundregistrene (Enhetsregisteret) open API for legal name,
  org.nr, address — only the privacy email needs manual verification.
- Grow by demand: prioritise companies people search for / report,
  not a fixed target count. Re-verify entries periodically.

## v2 — response scorecard (NOT in v1)
Public accountability for companies, based on facts, not opinion.
- Rejected: up/down votes. Trivially gamed without login, anti-gaming means
  tracking IPs/fingerprints (= personal data), and crowd opinion like
  "2.1/5 stars" is hard to defend if a company objects.
- Instead: users report the OUTCOME of their request:
  answered on time / answered late / ignored / escalated to Datatilsynet.
  Optional facts: did they disclose the ATS? confirm/deny automated decision?
- Company page shows aggregated, factual stats, e.g.
  "7 of 9 reported requests unanswered past the legal deadline".
- Rules:
  - No names (applicant or recruiter), no free-text comments shown publicly.
  - Show stats only above a minimum number of reports, so one person
    can't define a company's record.
  - Wording sticks to facts ("reported unanswered"), never accusations.
  - Give companies a contact route to dispute / respond.
- Abuse protection still needed (rate limiting, review queue). Design it
  together with v2 accounts — tying reports to tracked cases makes them
  much harder to fake.
- Makes the site a data controller → privacy policy, retention rules,
  deletion route. Accepted in v2, not before.
- The aggregate dataset is the journalism / advocacy value from
  "Business reality check".

## Content spine — the three templates
The whole product's content is these three documents, as fill-in templates.

### 1. The request (Art 15 + 22)
Key moves:
- Identify as data subject + list identifying fields
- Art 15: all personal data re: the application, purpose, recipients
  (name the ATS explicitly, e.g. Teamtailor), retention period
- Art 22: was it automated? If a same-day/next-day rejection, state that
  the speed suggests automation. Request logic info + human re-review.
- Cite 1-month deadline (art. 12 nr. 3)

### 2. The day-30 reminder (TO DRAFT)
- Short. References original request date.
- States the 1-month deadline has passed (= non-compliance).
- Gives 14 days, then Datatilsynet escalation.

### 3. The Datatilsynet complaint (TO DRAFT)
- Sent to postkasse@datatilsynet.no
- References: what was asked, when, that no reply came.
- This is the step almost everyone gives up at / doesn't know exists.
  Making it a guided 2-min flow is the most valuable single feature.

## Honest caveats to bake into the product (don't overpromise)
- The request forces disclosure + human review; it does NOT force a hire
  or guarantee a satisfying answer. Keep that promise accurate or users
  feel cheated.
- Art 22's "solely automated" has a loophole: if a human touched the
  shortlist at any point, the company sidesteps it. Art 15 is the
  harder-to-dodge workhorse — lead with it.
- Not legal advice. The tool generates correct-structured requests;
  it isn't a lawyer.

## Business reality check (keep expectations honest)
- Target users (broke, rejected applicants) are the worst payers alive.
  This is probably NOT a subscription B2C business.
- Realistic outcomes, in order of likelihood:
  1. Free tool + portfolio piece + "the GDPR-rights guy" cred
  2. The aggregate dataset (who auto-rejects fastest, who stonewalls
     regulators) → journalism / advocacy / research value
  3. B2B/org sale to a student union or similar who buys it FOR members
- Goal per the founder: ~0 cost, make a statement, maybe pocket change
  via tips. That's achievable. A paywall on free-LLM-able text is not.

## Stack (founder's existing: React Native/Expo, TS, Node/Express, Supabase, Drizzle)
- v1: Astro + React islands + TS, static output, deployed on Cloudflare
  Pages (free; rebuilds on git push).
  - Why Astro: per-company pages are the discovery channel, so they must
    ship as real HTML for search engines. Astro does that by default;
    interactive parts (lookup, form, template generator) stay React.
  - No backend, no database, NO user data. Form input never leaves the
    browser; never put it in URL query strings.
  - Company table as JSON/TS in the repo. Git history = audit trail of
    address changes. Corrections via GitHub issue / mailto (domain only).
  - Templates as TS string builders.
  - Analytics: Cloudflare Web Analytics (cookieless), plus counting
    copy / open-in-email clicks to measure real usage.
  - Cost: domain only.
- NO LLM call needed — the request structure is fixed; a template is more
  reliable AND free. Skip the AI.
- v2 (only if validated): Supabase (+ Drizzle) for auth, case tracking,
  countdown logic, escalation state machine, and scorecard reports.
  Astro stays; scorecard stats load live via an island, writes go through
  Cloudflare server endpoints. Accept the data-controller responsibility then.
  Note: Supabase free tier pauses inactive projects (~1 week, verify).

## Next steps
1. Build v1 static tool this weekend.
2. Seed the company table with ~15–20 real Telemark-student employers.
3. Put it in front of USN students.
4. If people use it AND start asking "they ignored me, now what" → that's
   the signal to build v2.