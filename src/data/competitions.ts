/**
 * Math competitions East Bay students can enter, for the Events & Competitions page (/events/).
 *
 * Every fact here comes from the organizer's own website, checked on September 23, 2026
 * (see VERIFIED_ON). EBMA is not affiliated with any of these organizations. Before changing an
 * entry, re-check it against the official site; never add a date the organizer has not posted.
 *
 * - `dates` holds exact 2026–27 dates the organizer has published. They feed the calendar
 *   figure and Table 2 on /events/. Dates that have passed are dropped at build time.
 * - `typically` is the organizer's own wording for the usual timing, used only when no exact
 *   2026–27 date is posted; `typicalWindow` places it on the calendar figure as an open mark.
 * - `pending` says what is not posted yet.
 */

export type CostTag = 'free' | 'paid' | 'varies' | 'not-stated';
export type CompetitionGroup = 'middle' | 'high' | 'olympiad' | 'online';

export interface CompetitionDate {
  /** What happens on the date, as shown in the calendar, e.g. 'AMC 10/12 A'. */
  label: string;
  /** ISO date (Pacific calendar day). */
  start: string;
  /** Last day of a multi-day contest or window (inclusive). */
  end?: string;
  /** A contest day, a submission deadline, or a window during which the contest is held. */
  kind: 'contest' | 'deadline' | 'window';
  /** Where it happens, e.g. 'UC Berkeley', 'Online'. */
  where?: string;
  /** A short extra fact, e.g. 'Registration closed'. */
  note?: string;
  /** Calendar figure: put this date on its own row with this name (default: one row per competition). */
  figRow?: string;
  /** Calendar figure: how to print the date, with {d} for the date, e.g. 'A {d}' or '{d} online'. */
  figTag?: string;
}

export interface Competition {
  /** Anchor id on /events/ (#c-<id>). */
  id: string;
  name: string;
  /** Short name for the calendar figure. */
  short: string;
  url: string;
  org: string;
  description: string;
  /** Who can enter. */
  level: string;
  /** Short "who can enter" for the calendar table. */
  levelShort: string;
  /** Format in one line: questions, time, rounds, teams. */
  format: string;
  /** Where it usually happens, when the organizer says (used where no dated entry gives a place). */
  venue?: string;
  cost: CostTag;
  /** Extra verified cost detail (fee waivers, who pays). */
  costNote?: string;
  /** The usual timing, in the organizer's terms, plus this season's dates where posted. */
  when: string;
  tags: string[];
  group: CompetitionGroup;
  dates: CompetitionDate[];
  typically?: string;
  typicalWindow?: { start: string; end: string; label: string };
  pending?: string;
}

/** The day every entry was last checked against its official site. */
export const VERIFIED_ON = '2026-09-23';

/** The span of the calendar figure: September 2026 through June 2027. */
export const SEASON = { start: '2026-09-01', end: '2027-06-30', label: '2026–27' } as const;

const MAA_AMC = 'https://maa.org/student-programs/amc/';
const MAA_INV = 'https://maa.org/maa-invitational-competitions/';

export const competitions: Competition[] = [
  /* ---------------- middle school ---------------- */
  {
    id: 'amc-8',
    name: 'AMC 8',
    short: 'AMC 8',
    url: MAA_AMC,
    org: 'Mathematical Association of America (MAA)',
    description:
      'The MAA’s multiple-choice contest for middle school. Students take it through a host school or site; students and parents do not register with the MAA directly.',
    level: 'Grade 8 and below',
    levelShort: 'Grade 8 and below',
    format: '25 multiple-choice questions in 40 minutes',
    cost: 'varies',
    costNote: 'Host schools and sites register and pay the fees',
    when: 'Every January, over the course of a week. 2027: January 21–27.',
    tags: ['multiple-choice', 'individual', 'national', 'middle school'],
    group: 'middle',
    dates: [{ label: 'AMC 8', start: '2027-01-21', end: '2027-01-27', kind: 'window', where: 'At host schools and sites' }],
  },
  {
    id: 'mathcounts',
    name: 'MATHCOUNTS Competition Series',
    short: 'MATHCOUNTS',
    url: 'https://www.mathcounts.org/programs/mathcounts-competition-series',
    org: 'MATHCOUNTS Foundation',
    description:
      'National middle school program of live contests that advance from school to chapter, state and national levels. Students whose school doesn’t take part can register on their own.',
    level: 'Grades 6–8',
    levelShort: 'Grades 6–8',
    format: 'Sprint, Target, Team and Countdown rounds; school, chapter, state and national levels',
    cost: 'paid',
    costNote: 'Title I schools get 50% off',
    when: 'Chapter contests in February, state in March, national in May.',
    tags: ['middle school', 'team', 'individual', 'in-person', 'national'],
    group: 'middle',
    dates: [
      { label: 'MATHCOUNTS chapter contests', start: '2027-02-01', end: '2027-02-28', kind: 'window', note: 'East Bay chapter: Feb 21', figRow: 'MATHCOUNTS chapters' },
      { label: 'MATHCOUNTS state contests', start: '2027-03-01', end: '2027-03-31', kind: 'window', note: 'For students who advance', figRow: 'MATHCOUNTS state' },
      { label: 'MATHCOUNTS National', start: '2027-05-09', end: '2027-05-10', kind: 'contest', note: 'For students who advance', figRow: 'MATHCOUNTS National' },
    ],
  },
  {
    id: 'mathcounts-ca',
    name: 'MATHCOUNTS of California chapter competitions',
    short: 'MATHCOUNTS East Bay',
    url: 'https://cspeef.org/competitions/',
    org: 'MATHCOUNTS of California (California Society of Professional Engineers Education Foundation)',
    description:
      'California’s MATHCOUNTS chapter contests. Your school’s ZIP code decides your chapter: East Bay schools fall in the East Bay, Diablo or Fremont chapter. Top finishers advance to the Northern California state contest.',
    level: 'Grades 6–8',
    levelShort: 'Grades 6–8',
    format: 'Chapter contest in person; your chapter is set by your school’s ZIP code',
    cost: 'paid',
    costNote: 'Registration fees are paid to national MATHCOUNTS',
    when: 'East Bay chapter: Sunday, February 21, 2027, in Castro Valley.',
    tags: ['middle school', 'local', 'East Bay', 'MATHCOUNTS', 'in-person', 'team'],
    group: 'middle',
    dates: [
      {
        label: 'MATHCOUNTS East Bay chapter',
        start: '2027-02-21',
        kind: 'contest',
        where: 'Castro Valley',
        note: 'Diablo and Fremont chapters: 2027 dates not yet posted',
      },
    ],
    pending: 'Diablo and Fremont chapter dates for 2027 are not yet posted.',
  },
  {
    id: 'bmmt',
    name: 'Berkeley mini Math Tournament (BmMT)',
    short: 'BmMT',
    url: 'https://berkeley.mt/events/bmmt-2026/',
    org: 'Berkeley Math Tournament (a UC Berkeley student-led group)',
    description:
      'The Berkeley Math Tournament’s contest for middle schoolers, held on the UC Berkeley campus, with a separate online edition.',
    level: 'Grade 8 and below',
    levelShort: 'Grade 8 and below',
    format: 'Teams of up to 5: Puzzle, Individual, Team and Relay rounds',
    venue: 'UC Berkeley, plus an online edition',
    cost: 'paid',
    costNote: 'Fee waivers for financial hardship',
    when: 'In 2026: April 12 in person and June 6 online.',
    tags: ['middle school', 'team', 'in-person', 'online', 'Bay Area', 'East Bay'],
    group: 'middle',
    dates: [],
    pending: '2027 dates not yet posted (in 2026: April 12, and June 6 online).',
  },

  /* ---------------- high school ---------------- */
  {
    id: 'amc-10-12',
    name: 'AMC 10 & AMC 12',
    short: 'AMC 10 & 12',
    url: MAA_AMC,
    org: 'Mathematical Association of America (MAA)',
    description:
      'The MAA’s multiple-choice contests for high school, taken through a host school or site. A qualifying score on either one earns an invitation to the AIME.',
    level: 'AMC 10: grade 10 and below. AMC 12: grade 12 and below',
    levelShort: 'Grade 10 / 12 and below',
    format: '25 multiple-choice questions in 75 minutes',
    cost: 'varies',
    costNote: 'Host schools and sites register and pay the fees',
    when: 'Every November, in two versions. 2026: A on November 5, B on November 13.',
    tags: ['multiple-choice', 'individual', 'national', 'high school', 'olympiad pathway'],
    group: 'high',
    dates: [
      { label: 'AMC 10/12 A', start: '2026-11-05', kind: 'contest', where: 'At host schools and sites', figTag: 'A {d}' },
      { label: 'AMC 10/12 B', start: '2026-11-13', kind: 'contest', where: 'At host schools and sites', figTag: 'B {d}' },
    ],
  },
  {
    id: 'bmt',
    name: 'Berkeley Math Tournament (BMT)',
    short: 'BMT',
    url: 'https://berkeley.mt/',
    org: 'Berkeley Math Tournament (a UC Berkeley student group, independent of the University of California)',
    description:
      'Student-run tournament with original problems for high school and advanced middle school students, held on the UC Berkeley campus. A separate online edition follows.',
    level: 'Grade 12 and below (high school and advanced middle school)',
    levelShort: 'Grade 12 and below',
    format: 'Teams of up to 6: a proof-based Power round, an Individual round and a Guts round',
    cost: 'paid',
    costNote: 'Fee waivers for financial hardship',
    when: 'Once a year. 2026: November 14 at UC Berkeley; online edition December 5.',
    tags: ['high school', 'team', 'in-person', 'online', 'Bay Area', 'East Bay'],
    group: 'high',
    dates: [
      { label: 'BMT 2026', start: '2026-11-14', kind: 'contest', where: 'UC Berkeley' },
      { label: 'BMT 2026 Online', start: '2026-12-05', kind: 'contest', where: 'Online', figTag: '{d} online' },
    ],
  },
  {
    id: 'smt',
    name: 'Stanford Math Tournament (SMT)',
    short: 'SMT',
    url: 'https://www.stanfordmathtournament.org/',
    org: 'Stanford Math Tournament (Stanford students, supported by SUMO and the Stanford Department of Mathematics)',
    description:
      'Student-run tournament at Stanford for US high schoolers, with teams chosen by application and lottery. SMT Online is open to middle and high schoolers anywhere.',
    level: 'High school (in person); middle and high school (SMT Online)',
    levelShort: 'High school; SMT Online also middle school',
    format: 'Teams of 5–6; individuals can apply and are placed on teams',
    venue: 'Stanford, plus SMT Online',
    cost: 'paid',
    costNote: 'Financial aid available',
    when: 'In 2026: April 17–18 at Stanford, with SMT Online soon after.',
    tags: ['high school', 'middle school', 'team', 'in-person', 'online', 'Bay Area'],
    group: 'high',
    dates: [],
    pending: '2027 dates not yet posted (in 2026: April 17–18).',
  },
  {
    id: 'hmmt',
    name: 'HMMT (Harvard–MIT Mathematics Tournament)',
    short: 'HMMT',
    url: 'https://www.hmmt.org/',
    org: 'HMMT (organized by students at Harvard, MIT and nearby schools)',
    description:
      'Student-run high school tournaments in Massachusetts: HMMT November at Harvard, and the harder HMMT February at MIT, with a proof-based team round. Spots are given by lottery.',
    level: 'High school',
    levelShort: 'High school',
    format: 'Individual, team and guts rounds; November teams of 4–6, February teams of 6–8',
    cost: 'paid',
    when: 'HMMT November at Harvard and HMMT February at MIT. Next: November 7, 2026 and February 13, 2027.',
    tags: ['high school', 'team', 'individual', 'in-person', 'national', 'olympiad-level'],
    group: 'high',
    dates: [
      { label: 'HMMT November', start: '2026-11-07', kind: 'contest', where: 'Harvard, Massachusetts', note: 'Registration closed', figTag: 'Harvard {d}' },
      { label: 'HMMT February', start: '2027-02-13', kind: 'contest', where: 'MIT, Massachusetts', figTag: 'MIT {d}' },
    ],
  },
  {
    id: 'arml',
    name: 'American Regions Mathematics League (ARML)',
    short: 'ARML',
    url: 'https://arml3.com/',
    org: 'American Regions Mathematics League',
    description:
      'National contest for regional teams of 15 at several university sites. Bay Area students can join the SFBA/NorCal ARML team, which is open regardless of past contest scores.',
    level: 'Grade 12 and below (students who have finished high school cannot enter)',
    levelShort: 'Grade 12 and below',
    format: 'Regional teams of 15, in person at university host sites',
    venue: 'University host sites',
    cost: 'varies',
    costNote: 'Regional teams charge their own fees',
    when: 'Dates are not listed here; check the official site.',
    tags: ['team', 'high school', 'national', 'in-person', 'regional teams', 'Bay Area'],
    group: 'high',
    dates: [],
    pending: 'Dates not listed here; see the official site.',
  },
  {
    id: 'math-prize-for-girls',
    name: 'Math Prize for Girls',
    short: 'Math Prize for Girls',
    url: 'https://mathprize.atfoundation.org/',
    org: 'Advantage Testing Foundation and Jane Street',
    description:
      'A contest held each fall at MIT for about 250 students. Applicants must be female in gender identity, in grade 11 or below, and have taken an official November AMC 10 or 12.',
    level: 'Grade 11 and below, by application',
    levelShort: 'Grade 11 and below, by application',
    format: '20 problems in 2.5 hours, in person at MIT',
    cost: 'free',
    costNote: 'No fee to apply or take part; travel is not covered',
    when: 'Each fall at MIT. 2026: Sunday, October 11 (applications closed May 31).',
    tags: ['high school', 'individual', 'in-person', 'girls', 'national', 'AMC-qualified'],
    group: 'high',
    dates: [
      {
        label: 'Math Prize for Girls',
        start: '2026-10-11',
        kind: 'contest',
        where: 'MIT, Massachusetts',
        note: '2026 applications closed May 31',
      },
    ],
  },

  /* ---------------- olympiad & invitational ---------------- */
  {
    id: 'aime-usamo',
    name: 'AIME, USAJMO & USAMO',
    short: 'AIME',
    url: MAA_INV,
    org: 'Mathematical Association of America (MAA)',
    description:
      'The invitation-only next steps for top AMC 10 and 12 scorers: first the AIME, then the proof-based USAJMO and USAMO olympiads.',
    level: 'By invitation: the AIME needs a qualifying AMC 10/12 score; USAJMO and USAMO invitations are based mainly on AIME scores',
    levelShort: 'By invitation (qualifying AMC 10/12 score)',
    format: 'AIME: 15 questions with answers 0–999, in two 90-minute parts. USAJMO/USAMO: complete proofs, 3 problems in 4.5 hours per day',
    cost: 'paid',
    costNote: 'The AIME fee is paid directly to Pearson',
    when: 'AIME 2027: February 5–6 at Pearson testing centers. USAJMO and USAMO follow, at select official sites.',
    tags: ['invitational', 'olympiad', 'proof-based', 'individual', 'national', 'high school'],
    group: 'olympiad',
    dates: [{ label: 'AIME', start: '2027-02-05', end: '2027-02-06', kind: 'contest', where: 'Pearson testing centers', note: 'By invitation' }],
    pending: 'USAJMO and USAMO dates: see the MAA site.',
  },
  {
    id: 'bamo',
    name: 'Bay Area Mathematical Olympiad (BAMO)',
    short: 'BAMO',
    url: 'https://www.bamo.org/',
    org: 'Bay Area Mathematical Olympiad (local mathematicians, teachers and universities, with logistical support from SLMath, formerly MSRI)',
    description:
      'Proof-based olympiad for Bay Area middle and high school students. Schools and math circles register and proctor it in person; students cannot register on their own or take it at home.',
    level: 'BAMO-8: grade 8 and below. BAMO-12: grade 12 and below',
    levelShort: 'BAMO-8: grade 8 and below; BAMO-12: grade 12 and below',
    format: '5 essay-proof problems in 4 hours',
    venue: 'Schools and math circles that proctor it',
    cost: 'not-stated',
    costNote: 'No fee is stated on the official site',
    when: 'Typically the last Tuesday or Wednesday of February.',
    tags: ['olympiad', 'proof-based', 'Bay Area', 'local', 'middle school', 'high school', 'individual'],
    group: 'olympiad',
    dates: [],
    typically: 'Typically the last Tuesday or Wednesday of February',
    // The last Tuesday or Wednesday of February 2027 necessarily falls between Feb 22 and 28.
    typicalWindow: { start: '2027-02-22', end: '2027-02-28', label: 'late February' },
    pending: 'The 2027 date is not yet posted.',
  },

  /* ---------------- online ---------------- */
  {
    id: 'usamts',
    name: 'USA Mathematical Talent Search (USAMTS)',
    short: 'USAMTS',
    url: 'https://www.usamts.org/',
    org: 'Art of Problem Solving Initiative (AoPSI)',
    description:
      'A free, proof-based contest you do on your own time, with over a month per round. Graders return written feedback, and it is one route to qualifying for the AIME.',
    level: 'Middle and high school (US citizens or residents who have not finished high school)',
    levelShort: 'Middle and high school',
    format: 'Individual; each round is 1 puzzle and 4 proof-based problems, written up on your own time',
    cost: 'free',
    when: 'Three rounds each school year. 2026–27 Round 1 is due October 13, 2026.',
    tags: ['proof-based', 'individual', 'online', 'free', 'middle school', 'high school', 'AIME pathway'],
    group: 'online',
    dates: [{ label: 'USAMTS Round 1 due', start: '2026-10-13', kind: 'deadline', where: 'Online', note: 'First of three rounds', figTag: 'Round 1 due {d}' }],
  },
  {
    id: 'purple-comet',
    name: 'Purple Comet! Math Meet',
    short: 'Purple Comet',
    url: 'https://purplecomet.org/',
    org: 'Purple Comet! Math Meet',
    description:
      'A free, international online team contest. Teams start any time during a ten-day window, with an adult supervisor.',
    level: 'Middle and high school',
    levelShort: 'Middle and high school',
    format: 'Teams of 1–6. Middle school: 20 problems in 60 minutes. High school: 30 problems in 90 minutes',
    cost: 'free',
    when: 'A ten-day online window each year. 2027: April 6–15.',
    tags: ['team', 'online', 'free', 'international', 'middle school', 'high school'],
    group: 'online',
    dates: [{ label: 'Purple Comet', start: '2027-04-06', end: '2027-04-15', kind: 'window', where: 'Online' }],
  },
  {
    id: 'math-kangaroo',
    name: 'Math Kangaroo USA',
    short: 'Math Kangaroo',
    url: 'https://mathkangaroo.org/mks/',
    org: 'Math Kangaroo USA, NFP (questions chosen by the international Kangourou sans Frontières committee)',
    description:
      'International multiple-choice contest, taken in person or online through registered centers. A team contest is also offered.',
    level: 'Grades K–12 (kindergartners take the grade 1 test)',
    levelShort: 'Grades K–12',
    format: '75 minutes, multiple choice: 24 questions (grades 1–4) or 30 questions (grades 5–12)',
    venue: 'Registered centers, in person or online',
    cost: 'paid',
    when: 'Individual contest every March (the FAQ says the third Thursday); team contest every fall.',
    tags: ['multiple-choice', 'individual', 'team', 'international', 'elementary', 'middle school', 'high school'],
    group: 'online',
    dates: [],
    typically: 'Individual contest annually in March (the FAQ says the third Thursday); team contest in the fall',
    typicalWindow: { start: '2027-03-01', end: '2027-03-31', label: 'March' },
    pending: 'The exact 2027 date is not listed here.',
  },
];

export const groups: { id: CompetitionGroup; title: string; dek: string }[] = [
  { id: 'middle', title: 'Middle school', dek: 'Contests written for grades 8 and below.' },
  { id: 'high', title: 'High school', dek: 'Individual contests and team tournaments, near home and farther away.' },
  { id: 'olympiad', title: 'Olympiad & invitational', dek: 'Proof-based olympiads, and contests you qualify for.' },
  { id: 'online', title: 'Online options', dek: 'Contests you can take online. Two of the three are free.' },
];

export const costLabel: Record<CostTag, string> = {
  free: 'Free',
  paid: 'Paid',
  varies: 'Cost varies',
  'not-stated': 'Fee not stated',
};

/* ---------------- calendar helpers ---------------- */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const parse = (iso: string) => iso.split('-').map(Number) as [number, number, number];

/** Days since 1970-01-01 for an ISO date, with no time-zone surprises. */
export const dayNum = (iso: string) => {
  const [y, m, d] = parse(iso);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

/** "Thu, Nov 5" / "Jan 21–27" / "Feb 28 – Mar 3" (year optional). */
export function formatRange(start: string, end?: string, opts: { year?: boolean; weekday?: boolean } = {}) {
  const [y1, m1, d1] = parse(start);
  const yr = opts.year ? `, ${y1}` : '';
  if (!end || end === start) {
    const wk = opts.weekday ? `${WK[new Date(Date.UTC(y1, m1 - 1, d1)).getUTCDay()]}, ` : '';
    return `${wk}${MON[m1 - 1]} ${d1}${yr}`;
  }
  const [, m2, d2] = parse(end);
  return m1 === m2 ? `${MON[m1 - 1]} ${d1}–${d2}${yr}` : `${MON[m1 - 1]} ${d1} – ${MON[m2 - 1]} ${d2}${yr}`;
}

export interface CalendarItem extends CompetitionDate {
  competition: Competition;
}

/**
 * Dated items still to come, soonest first. "Today" is the later of the build date and
 * VERIFIED_ON, so a rebuild quietly drops contests that have passed.
 */
export function upcomingDates(now = new Date()): CalendarItem[] {
  const today = now.toISOString().slice(0, 10);
  const asOf = today > VERIFIED_ON ? today : VERIFIED_ON;
  return competitions
    .flatMap((c) => c.dates.map((d) => ({ ...d, competition: c })))
    .filter((d) => (d.end ?? d.start) >= asOf)
    .sort((a, b) => a.start.localeCompare(b.start) || (a.end ?? a.start).localeCompare(b.end ?? b.start));
}
