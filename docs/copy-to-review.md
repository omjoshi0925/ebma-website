# Draft copy to review before launch

Everything on the site that states a fact about the association is either a `??` placeholder (see
[PLACEHOLDERS.md](../PLACEHOLDERS.md)) or a fact about a third party that was checked on that
party's own website on September 23, 2026. The site's wording (mission, values, calls to action)
is draft copy written for the association. Most of it is voice and can stay as it is. The items
below go further: they are **commitments**. Please confirm each one is something the association
will actually do, or edit or delete it.

## Mission and values

- **Mission** (About §1, Definition 1.1): "To give every curious student in the East Bay a way into
  real mathematics, whatever school they attend and wherever they are starting from."
- **Abstract** (Home) and **About §1**: "We aim to bring students together across schools and
  cities to explore, to compete, and to find out how far a good idea can go", and "to gather good
  problems and free resources so the mathematics doesn't stop when an event does."
- **Axioms** (About §2): curiosity counts most; being stuck is part of it; better together;
  straight answers ("Families should know the dates, the costs, and who is supervising before
  anyone signs up. If we don't know something yet, we say so.").

## Promises to families

- Every EBMA event will list its cost, if it has one, before anyone signs up (About FAQ; Home Case 3.2
  "Dates, places, and costs posted up front").
- A real person will read every message and write back (About FAQ Q8; Get Involved; the form's
  confirmation). The reply time itself is the `get-involved.response-time` placeholder.
- Volunteers are welcome (About §5; Get Involved Case 1.4).

## Promises to sponsors

- Recognition: the sponsor's name or logo on the site and thanks at events, depending on level
  (Sponsors §4). Levels are the `sponsors.tiers` placeholder.
- After each school year, every sponsor will receive a short report: what took place, how many
  students took part, and where the money went (Sponsors §2 and §4).
- "We'll confirm the details in writing and put your name or logo up once you approve it"
  (Sponsors §6).
- Sponsorship never comes with students' names or contact details (Sponsors Remark 4.2; Privacy).

## Promises in the Privacy Notice

- Data use, in one sentence used everywhere: "We use what you send to reply to you, to send
  anything you asked for, and (if you share your school, city, or grade) to plan events and
  resources that suit students. We never sell it or share it, including with sponsors."
- Deletion on request; stopping updates on request; deleting details a child under 13 sent
  themselves; updating the notice and its effective date before any change takes effect.
- The notice describes what this code does (no cookies, no analytics, no third-party resources, a
  salted IP hash only for rate limiting). If you later turn on Cloudflare Web Analytics, Zaraz, a
  sign-up alert webhook, or anything similar, update §1, §3, and §5 first.
- Have the notice reviewed (the `privacy.review` placeholder) before launch.

## Third-party facts that will go stale

- The 2026–27 competition calendar (`src/data/competitions.ts`) and the resource library
  (`src/data/resources.ts`) were verified on September 23, 2026 (`VERIFIED_ON`). Re-check dates
  and program details each summer; the calendar hides contests once they pass, but next season's
  dates must be added by hand.
