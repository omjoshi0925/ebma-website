# Draft copy to review before launch

Everything on the site that states a fact about the association is either a `??` placeholder (see
[PLACEHOLDERS.md](../PLACEHOLDERS.md)) or a fact about a third party that was checked on that
party's own website on September 23, 2026. The site's wording (mission, values, calls to action)
is draft copy written for the association. Most of it is voice and can stay as it is. The items
below go further: they are **commitments**. Please confirm each one is something the association
will actually do, or edit or delete it.

## Mission and values

- **Mission** (About §1, Definition 1.1): "To give anyone in the East Bay who is curious a way into
  real mathematics, wherever they are starting from."
- **Abstract** (Home): "We bring people together to listen, to explore, and to find out how far a
  good idea can go, in mathematics and in the fields next to it." **About §1**: "We also gather good
  problems and free resources, so the mathematics doesn't stop when an event does."
- **Axioms** (About §2): curiosity counts most; being stuck is part of it; better together;
  straight answers ("You should know the date, the place, and the cost before you sign up. If we
  don't know something yet, like a date, we say so.").

## Events

- The three upcoming talks and the past one (`src/data/events.ts`, shown on Home and Events) were
  written from what the owner said on 2026-09-29. The two talks by Om Joshi summarize the public
  studies they link to (the swim-pacing study's README and paper; the options study's talk outline
  and paper). Check the titles and descriptions read the way you'd introduce them.
- The aerospace and data-analytics talks say only what is known: a speaker from industry, a talk,
  and (for data analytics) questions afterward. Add the speaker, topic, date, time and place when
  they are set.

## Promises to members

- A real person will read every message and write back, usually within 3–5 days (Get Involved;
  the form's confirmation; the footer).
- Joining is free, and anyone interested in math can join (About; Get Involved; the footer).
- Volunteers are welcome (About §5; Get Involved Case 1.3).
- Trips: "Join EBMA, and tell us in the form what you'd like to try" (Get Involved Case 1.2)
  implies members can ask to come along on trips.

## Promises in the Privacy Notice

- Data use, in one sentence used everywhere: "We use what you send to reply to you, to send
  anything you asked for, and (if you share your school, city, or grade) to plan events and
  resources that suit our members. We never sell it or share it."
- Deletion on request; deleting details a child under 13 sent themselves; updating the notice and
  its effective date before any change takes effect.
- The notice describes what this code does (no cookies, no analytics, no third-party resources, a
  salted IP hash only for rate limiting). If you later turn on Cloudflare Web Analytics, Zaraz, a
  sign-up alert webhook, or anything similar, update §1, §3, and §5 first.
- Have the notice reviewed (the `privacy.review` placeholder) before launch.

## Third-party facts that will go stale

- The 2026–27 competition calendar (`src/data/competitions.ts`) and the resource library
  (`src/data/resources.ts`) were verified on September 23, 2026 (`VERIFIED_ON`). Re-check dates
  and program details each summer; the calendar hides contests once they pass, but next season's
  dates must be added by hand.
