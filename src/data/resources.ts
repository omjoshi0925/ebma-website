/**
 * The Student Resources library (src/pages/resources.astro, §3).
 *
 * Every entry is a third-party resource whose name, organization, description, level, cost and
 * timing were verified against the organization's own official site on 2026-09-23 (the research
 * file's `evidence` notes record how). Rules for editing this file:
 *
 *   - Only add facts you have checked on the official site, and update VERIFIED_ON when you do.
 *   - Dates (deadlines, terms) belong here, in `timing` or `description`, where the page shows
 *     them with the "verified on" note. Don't copy them into running text on the page.
 *   - House style: serial comma; "problem solving" as a noun; en dash in ranges (K–12, 5–8 pm);
 *     level labels like "Middle and high school" and "Grade 8 and up".
 *   - Never imply affiliation, endorsement or partnership with EBMA.
 *   - Competitions are listed on the Events page (/events/#competitions), not here.
 *   - `cost` is the tag shown on the card: 'free', 'free-tier' (free with paid extras), 'paid'
 *     or 'varies'. The "Free only" filter shows 'free' and 'free-tier'.
 */

export type ResourceCategory = 'practice' | 'local' | 'summer' | 'reading';
export type ResourceCost = 'free' | 'free-tier' | 'paid' | 'varies';

export interface Resource {
  /** Stable slug; the card's anchor is #lib-<id>. */
  id: string;
  category: ResourceCategory;
  name: string;
  /** Organization, author or publisher. Hidden on the card when it repeats the name. */
  org: string;
  /** Official site. */
  url: string;
  description: string;
  level: string;
  cost: ResourceCost;
  /** When it runs or when applications are due, if the official site says. */
  timing?: string;
}

export interface ResourceCategoryInfo {
  id: ResourceCategory;
  /** Heading in the library, e.g. "Free practice online". */
  title: string;
  /** Short label for the filter button. */
  short: string;
}

/** Date the descriptions were last checked against each official site. */
export const VERIFIED_ON = '2026-09-23';
export const VERIFIED_ON_LONG = 'September 23, 2026';

export const categories: ResourceCategoryInfo[] = [
  { id: 'practice', title: 'Free practice online', short: 'Practice online' },
  { id: 'local', title: 'Around the Bay', short: 'Around the Bay' },
  { id: 'summer', title: 'Summer & year-round programs', short: 'Summer programs' },
  { id: 'reading', title: 'Books', short: 'Books' },
];

export const costLabel: Record<ResourceCost, string> = {
  free: 'Free',
  'free-tier': 'Free tier',
  paid: 'Paid',
  varies: 'Varies',
};

export const isFree = (r: Pick<Resource, 'cost'>): boolean => r.cost === 'free' || r.cost === 'free-tier';

export const resources: Resource[] = [
  // ---------- practice ----------
  {
    id: 'alcumus',
    category: 'practice',
    name: 'Alcumus',
    org: 'Art of Problem Solving (AoPS)',
    url: 'https://artofproblemsolving.com/alcumus',
    description: 'Adaptive practice from Art of Problem Solving with over 13,000 problems and solutions, many from contests such as MATHCOUNTS and the AMC. Free; requires a free AoPS account.',
    level: 'Middle and high school',
    cost: 'free',
  },
  {
    id: 'aops-wiki-amc',
    category: 'practice',
    name: 'AoPS Wiki: AMC Problems and Solutions',
    org: 'Art of Problem Solving (community-edited wiki)',
    url: 'https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions',
    description: 'Community-edited AoPS Wiki archive of past AMC 8, AMC 10, AMC 12, AIME, USAMO, and USAJMO problems and solutions.',
    level: 'Middle and high school',
    cost: 'free',
  },
  {
    id: 'khan-academy',
    category: 'practice',
    name: 'Khan Academy Math',
    org: 'Khan Academy',
    url: 'https://www.khanacademy.org/math',
    description: 'Free lessons, videos, and practice exercises from a nonprofit, covering math from early elementary grades through AP/college calculus, statistics, and linear algebra.',
    level: 'All levels (K–12 and early college)',
    cost: 'free',
  },
  {
    id: 'evan-chen',
    category: 'practice',
    name: 'Evan Chen’s olympiad handouts and free books',
    org: 'Evan Chen',
    url: 'https://web.evanchen.cc/olympiad.html',
    description: 'Free PDF handouts by Evan Chen on olympiad algebra, combinatorics, geometry, number theory, and proof writing. His site also offers free drafts of the OTIS Excerpts problem book and the Napkin.',
    level: 'High school (olympiad level) and beyond',
    cost: 'free',
  },
  {
    id: 'project-euler',
    category: 'practice',
    name: 'Project Euler',
    org: 'Project Euler',
    url: 'https://projecteuler.net/',
    description: 'Challenging problems that combine mathematics and programming; most require writing code to solve. Problems can be browsed without an account, and a free account tracks progress.',
    level: 'High school and up',
    cost: 'free',
  },
  {
    id: '3blue1brown',
    category: 'practice',
    name: '3Blue1Brown',
    org: 'Grant Sanderson',
    url: 'https://www.3blue1brown.com/',
    description: 'Animated video lessons by Grant Sanderson that explain math visually, on topics such as linear algebra, calculus, and neural networks. Free on YouTube, with written versions of many lessons on the site.',
    level: 'High school and college',
    cost: 'free',
  },
  {
    id: 'numberphile',
    category: 'practice',
    name: 'Numberphile',
    org: 'Brady Haran',
    url: 'https://www.youtube.com/@numberphile',
    description: 'YouTube channel of videos about numbers and mathematics, made by Brady Haran since 2011. Free to watch.',
    level: 'All levels (general audience)',
    cost: 'free',
  },
  {
    id: 'mathologer',
    category: 'practice',
    name: 'Mathologer',
    org: 'Burkard Polster',
    url: 'https://www.youtube.com/@Mathologer',
    description: 'YouTube channel with accessible explanations of hard and beautiful mathematics, presented by Burkard Polster, a math professor at Monash University in Australia. Free to watch.',
    level: 'High school and up',
    cost: 'free',
  },
  {
    id: 'desmos',
    category: 'practice',
    name: 'Desmos Graphing Calculator',
    org: 'Desmos Studio',
    url: 'https://www.desmos.com/calculator',
    description: 'Free online graphing calculator for plotting functions, adding sliders, and animating graphs. Desmos also offers free scientific, geometry, and 3D calculators.',
    level: 'Middle school and up',
    cost: 'free',
  },
  {
    id: 'geogebra',
    category: 'practice',
    name: 'GeoGebra',
    org: 'GeoGebra',
    url: 'https://www.geogebra.org/',
    description: 'Interactive graphing, geometry, 3D, and scientific calculators plus ready-made activities. Free for non-commercial use, which includes most use by students, teachers, and parents.',
    level: 'All levels',
    cost: 'free',
  },
  {
    id: 'oeis',
    category: 'practice',
    name: 'OEIS (On-Line Encyclopedia of Integer Sequences)',
    org: 'The OEIS Foundation Inc.',
    url: 'https://oeis.org/',
    description: 'A searchable database of hundreds of thousands of integer sequences, with formulas and references. Useful for spotting patterns while exploring a problem.',
    level: 'All levels (reference)',
    cost: 'free',
  },
  {
    id: 'pauls-notes',
    category: 'practice',
    name: 'Paul’s Online Math Notes',
    org: 'Paul Dawkins (Lamar University)',
    url: 'https://tutorial.math.lamar.edu/',
    description: 'Free online and downloadable notes by Paul Dawkins covering algebra, Calculus I–III, and differential equations, written for the classes he teaches at Lamar University.',
    level: 'Advanced high school and college',
    cost: 'free',
  },
  {
    id: 'mit-ocw',
    category: 'practice',
    name: 'MIT OpenCourseWare',
    org: 'Massachusetts Institute of Technology',
    url: 'https://ocw.mit.edu/',
    description: 'Free lecture notes, exams, and videos from MIT courses, including many in mathematics. No registration required. Materials are university level and best suited to advanced students.',
    level: 'Advanced high school and college',
    cost: 'free',
  },
  // ---------- local ----------
  {
    id: 'berkeley-math-circle',
    category: 'local',
    name: 'Berkeley Math Circle',
    org: 'United Math Circles Foundation (umbrella nonprofit)',
    url: 'https://mathcircle.berkeley.edu/',
    description: 'Long-running math circle at UC Berkeley. Its Math Taught the Right Way program for middle and high schoolers meets Monday evenings (fall 2026 applications are closed); the BMC-Upper circle is paused through spring 2027.',
    level: 'Middle and high school',
    cost: 'paid',
    timing: 'Math Taught the Right Way meets Monday evenings, 5–8 pm, at UC Berkeley during the academic year; the fall 2026 term runs Aug 24–Dec 14, 2026',
  },
  {
    id: 'bmc-elementary',
    category: 'local',
    name: 'Berkeley Math Circle Elementary',
    org: 'Berkeley Math Circle',
    url: 'https://sumizdat.startlogic.com/bmc_elementary/home.html',
    description: 'The Berkeley Math Circle’s program for grades 1–6, running since 2009, with puzzles, games, and problem solving at three levels. Weekly classes are offered online and in person; financial aid is available.',
    level: 'Grades 1–6',
    cost: 'paid',
    timing: 'Fall 2026 and Spring 2027 classes meet weekly on Tuesdays or Wednesdays at 5, 6, or 7 pm Pacific',
  },
  {
    id: 'jrmf',
    category: 'local',
    name: 'Julia Robinson Mathematics Festival (JRMF)',
    org: 'Julia Robinson Mathematics Festival (nonprofit)',
    url: 'https://jrmf.org/',
    description: 'Nonprofit, started in the Bay Area in 2007, that runs noncompetitive math festivals built on hands-on puzzles. It hosts free monthly drop-in family math afternoons in Pleasanton and San Jose.',
    level: 'Ages 5–18 (drop-in events open to all ages)',
    cost: 'free',
    timing: '2nd Saturdays, 1–3 pm, at TEAM Theatre in Pleasanton and at RAFT in San Jose (Oct 10, Nov 14, Dec 12, 2026)',
  },
  {
    id: 'stanford-math-circle',
    category: 'local',
    name: 'Stanford Math Circle',
    org: 'Stanford Pre-Collegiate Studies, Stanford University',
    url: 'https://mathcircle.spcs.stanford.edu/',
    description: 'Weekly, quarter-long math circle sessions led by mathematicians and educators from the Stanford community and beyond. Online for grades 1–12 (open to students anywhere), with an in-person section for grades 9–12.',
    level: 'Grades 1–12',
    cost: 'paid',
    timing: 'Ten-week sessions in the Fall, Winter, and Spring quarters; Fall 2026 runs Sept 29–Dec 10, 2026',
  },
  {
    id: 'sf-math-circle',
    category: 'local',
    name: 'San Francisco Math Circle',
    org: 'San Francisco Math Circle, with SF State’s Center for Science & Math Education',
    url: 'https://sfmathcircle.org/',
    description: 'Math enrichment program affiliated with SF State’s Center for Science & Math Education, offering weekly small-group classes and summer day camps built on puzzles and games. Payment plans and scholarships available.',
    level: 'Grades 2–5 (fall classes); rising grades 2–6 (summer camps)',
    cost: 'paid',
    timing: 'Fall 2026 classes run in 10-week terms on Mondays, Wednesdays, or Saturdays at SF State, starting Sept 21–26',
  },
  {
    id: 'lawrence-hall',
    category: 'local',
    name: 'Lawrence Hall of Science',
    org: 'University of California, Berkeley',
    url: 'https://lawrencehallofscience.org/',
    description: 'UC Berkeley’s public science center, with hands-on exhibits, camps, and school programs. Exhibits include Making Music, on the math and science behind music, and activities such as math games from around the world.',
    level: 'All ages',
    cost: 'paid',
    timing: 'Open Wednesday–Sunday, 10 am–5 pm',
  },
  {
    id: 'slmath',
    category: 'local',
    name: 'SLMath Public Understanding of Math (Mathical Books)',
    org: 'Simons Laufer Mathematical Sciences Institute (SLMath, formerly MSRI), Berkeley',
    url: 'https://www.slmath.org/public-understanding-of-math',
    description: 'Berkeley math research institute (formerly MSRI) whose public outreach includes the Mathical Book Prize, honoring math-rich books for ages 2–18, and documentary films about mathematicians.',
    level: 'All ages (Mathical books for ages 2–18)',
    cost: 'varies',
    timing: 'Mathical prizes are announced each spring',
  },
  // ---------- summer ----------
  {
    id: 'mit-primes',
    category: 'summer',
    name: 'MIT PRIMES and PRIMES-USA',
    org: 'MIT Department of Mathematics',
    url: 'https://math.mit.edu/research/highschool/primes/',
    description: 'Free, year-long research and guided-reading programs for high school sophomores and juniors. PRIMES-USA mentors students remotely anywhere in the U.S. outside Greater Boston. Admission is by application and problem set.',
    level: 'Grades 10–11',
    cost: 'free',
    timing: 'Runs through the calendar year; applications for the 2027 program (PRIMES, PRIMES-USA, and PRIMES Circle) due November 2, 2026',
  },
  {
    id: 'mathroots',
    category: 'summer',
    name: '√mathroots @ MIT',
    org: 'MIT PRIMES, MIT Department of Mathematics',
    url: 'https://mathroots.mit.edu/',
    description: 'A free 14-day residential summer program at MIT on creative math and problem solving for high school students. It especially encourages applicants who have overcome barriers to learning. Admission is by application.',
    level: 'Grades 9–11 (current high school students who will still be in high school the next fall)',
    cost: 'free',
    timing: '14 days in summer (2026: July 1–15); applications open in early January and close in early March',
  },
  {
    id: 'ross',
    category: 'summer',
    name: 'Ross Mathematics Program',
    org: 'Ross Mathematics Foundation (nonprofit)',
    url: 'https://rossprogram.org/',
    description: 'A six-week residential summer program centered on number theory for motivated pre-college students; nearly all first-year students are 15–18. Admission is by application with math problems; need-based aid is available.',
    level: 'High school (nearly all first-year students are ages 15–18)',
    cost: 'paid',
    timing: 'Six weeks in summer (2026: June 14–July 24); applications due March 8 in the 2026 cycle',
  },
  {
    id: 'promys',
    category: 'summer',
    name: 'PROMYS (Program in Mathematics for Young Scientists)',
    org: 'PROMYS (nonprofit), at Boston University',
    url: 'https://promys.org/programs/promys/for-students/',
    description: 'A six-week residential summer program centered on number theory at Boston University for students ages 14–18 who have finished 9th grade. Admission includes a problem set; free for U.S. families earning under $80,000.',
    level: 'High school (ages 14–18, completed 9th grade)',
    cost: 'paid',
    timing: 'Six weeks in summer (2027: June 27–August 7); application deadline end of February 2027 (exact date to be announced)',
  },
  {
    id: 'mathcamp',
    category: 'summer',
    name: 'Canada/USA Mathcamp',
    org: 'Canada/USA Mathcamp (nonprofit)',
    url: 'https://www.mathcamp.org/',
    description: 'A five-week residential summer program for talented math students ages 13–18. Applicants solve a Qualifying Quiz. Aid is need-based; free for U.S. and Canadian families earning under $100,000 with typical assets.',
    level: 'Ages 13–18',
    cost: 'paid',
    timing: 'About five weeks in summer (2026: June 28–August 2). In the 2026 cycle applications opened January 12 and were due February 23; 2027 dates will be announced in December.',
  },
  {
    id: 'sumac',
    category: 'summer',
    name: 'Stanford University Mathematics Camp (SUMaC)',
    org: 'Stanford Pre-Collegiate Studies, Stanford University',
    url: 'https://sumac.spcs.stanford.edu/',
    description: 'Stanford’s selective summer math program for students in grades 10–11: a four-week residential session on campus or a three-week online session. Admission includes a proof-based exam; need-based aid is offered.',
    level: 'Grades 10–11 at time of application (at least 15 during program)',
    cost: 'paid',
    timing: 'Summer: 3 weeks online or 4 weeks residential; 2026 applications were due February 2, with decisions in mid-April',
  },
  {
    id: 'hcssim',
    category: 'summer',
    name: 'Hampshire College Summer Studies in Mathematics (HCSSiM)',
    org: 'Yellow Pig Math Foundation (separate from Hampshire College)',
    url: 'https://hcssim.org/',
    description: 'A six-week residential summer program in college-level math for high school students, most after 10th or 11th grade. Applicants take an Interesting Test. Aid is need-based; free for U.S. families earning under $85,000.',
    level: 'High school (most students have finished 10th or 11th grade)',
    cost: 'paid',
    timing: 'Six weeks in summer (2026: June 28–August 8); rolling decisions with a full-consideration deadline near the end of April. Moving to a new campus in 2027.',
  },
  {
    id: 'mathily',
    category: 'summer',
    name: 'MathILy',
    org: 'Mathematical Staircase, Inc. (nonprofit)',
    url: 'https://www.mathily.org/',
    description: 'A five-week intensive residential summer program in advanced, mostly discrete mathematics for high school students. Financial aid is need-based and can cover the full fee for admitted students with significant need.',
    level: 'High school',
    cost: 'paid',
    timing: 'Five weeks in summer (2026: June 28–August 1 at Bryn Mawr College); applications received by April 28 got full consideration in 2026',
  },
  {
    id: 'hsmc',
    category: 'summer',
    name: 'Honors Summer Math Camp (HSMC)',
    org: 'Mathworks, Texas State University',
    url: 'https://www.txst.edu/mathworks/mathworks-camps/hsmc.html',
    description: 'A six-week residential, multi-summer math camp for high school students at Texas State University. Returning students do original research with mentors. Admission is by application; need-based scholarships are offered.',
    level: 'High school',
    cost: 'paid',
    timing: 'Six weeks in summer (2027: June 20–July 31); applications open December 1 with rolling admission',
  },
  // ---------- reading ----------
  {
    id: 'how-to-solve-it',
    category: 'reading',
    name: 'How to Solve It',
    org: 'George Pólya (Princeton University Press)',
    url: 'https://press.princeton.edu/books/paperback/9780691164076/how-to-solve-it',
    description: 'Pólya’s classic guide to approaching problems, first published in 1945. It includes a heuristic dictionary covering techniques such as analogy, induction, and working backward from the goal.',
    level: 'High school and up',
    cost: 'paid',
  },
  {
    id: 'aops-intro',
    category: 'reading',
    name: 'Art of Problem Solving Introduction Series',
    org: 'Art of Problem Solving (Rusczyk, Patrick, Boppana, Crawford, and others)',
    url: 'https://artofproblemsolving.com/store/list/aops-curriculum',
    description: 'Full-course textbooks, each with a solutions book: Prealgebra, Introduction to Algebra, Counting & Probability, Geometry, and Number Theory. The publisher calls the series a complete curriculum for grades 6–10.',
    level: 'Grades 6–10',
    cost: 'paid',
  },
  {
    id: 'aops-vol-1',
    category: 'reading',
    name: 'The Art of Problem Solving, Volume 1: the Basics',
    org: 'Sandor Lehoczky and Richard Rusczyk (Art of Problem Solving)',
    url: 'https://artofproblemsolving.com/store/book/aops-vol1',
    description: 'A problem-solving textbook with a separate solutions book. The publisher aims it at students in grades 7–10 who are preparing for contests such as MATHCOUNTS and the AMC 8/10/12.',
    level: 'Grades 7–10',
    cost: 'paid',
  },
  {
    id: 'aops-vol-2',
    category: 'reading',
    name: 'The Art of Problem Solving, Volume 2: and Beyond',
    org: 'Richard Rusczyk and Sandor Lehoczky (Art of Problem Solving)',
    url: 'https://artofproblemsolving.com/store/book/aops-vol2',
    description: 'The follow-up to Volume 1, for students who have mastered its fundamentals. The publisher aims it at grades 9–12 and at advanced high school contests such as the AMC 12, AIME, and HMMT.',
    level: 'Grades 9–12',
    cost: 'paid',
  },
  {
    id: 'engel',
    category: 'reading',
    name: 'Problem-Solving Strategies',
    org: 'Arthur Engel (Springer, Problem Books in Mathematics)',
    url: 'https://link.springer.com/book/10.1007/b97682',
    description: 'A large collection of competition problems grouped by strategy (invariance, coloring, the extremal principle, induction, and more), with solutions for most. Written for contest trainers and participants.',
    level: 'Advanced high school (olympiad level)',
    cost: 'paid',
  },
  {
    id: 'art-and-craft',
    category: 'reading',
    name: 'The Art and Craft of Problem Solving (3rd Edition)',
    org: 'Paul Zeitz (Wiley)',
    url: 'https://www.wiley.com/en-us/the-art-and-craft-of-problem-solving-3rd-edition-p-9781119239901',
    description: 'Teaches mathematics through problem solving rather than routine exercises, drawing on the author’s experience as an International Mathematical Olympiad coach. Aimed at college students and independent learners.',
    level: 'College and advanced independent learners',
    cost: 'paid',
  },
  {
    id: 'proofs-from-the-book',
    category: 'reading',
    name: 'Proofs from THE BOOK',
    org: 'Martin Aigner and Günter M. Ziegler (Springer)',
    url: 'https://link.springer.com/book/10.1007/978-3-662-57265-8',
    description: 'A collection of elegant proofs from number theory, geometry, analysis, combinatorics, and graph theory. The title comes from Paul Erdős’s idea of “The Book” holding the best proof of each theorem.',
    level: 'Advanced high school and university',
    cost: 'paid',
  },
  {
    id: 'joy-of-x',
    category: 'reading',
    name: 'The Joy of x',
    org: 'Steven Strogatz',
    url: 'https://www.stevenstrogatz.com/books/the-joy-of-x',
    description: 'Short, accessible chapters that grew out of the author’s 2010 New York Times series “The Elements of Math.” It moves from numbers and shapes to calculus and infinity and assumes no prior background.',
    level: 'High school and general readers',
    cost: 'paid',
  },
  {
    id: 'flatland',
    category: 'reading',
    name: 'Flatland: A Romance of Many Dimensions',
    org: 'Edwin A. Abbott (free edition via Project Gutenberg)',
    url: 'https://www.gutenberg.org/ebooks/201',
    description: 'An 1884 novella narrated by a square living in a two-dimensional world, and a playful way into thinking about dimensions. It is in the public domain and free to read online.',
    level: 'Grade 8 and up',
    cost: 'free',
  },
  {
    id: 'euclid-in-the-rainforest',
    category: 'reading',
    name: 'Euclid in the Rainforest',
    org: 'Joseph Mazur (Plume / Penguin Random House)',
    url: 'https://www.penguinrandomhouse.com/books/299264/euclid-in-the-rainforest-by-joseph-mazur/',
    description: 'Explores logic and mathematical reasoning through adventure stories and historical narratives. It argues that logical reasoning is also a creative process shaped by intuition.',
    level: 'High school and general readers',
    cost: 'paid',
  },
  {
    id: 'mathematicians-lament',
    category: 'reading',
    name: 'A Mathematician’s Lament',
    org: 'Paul Lockhart (Bellevue Literary Press)',
    url: 'https://www.blpress.org/books/a-mathematicians-lament/',
    description: 'An essay by a research mathematician who has also taught K–12 students. It presents mathematics as a creative art and critiques how the subject is commonly taught in schools.',
    level: 'High school, parents, and educators',
    cost: 'paid',
  },
];

/** Look up a resource by id (used by the study advice in §2 so every URL has one source). */
export function resource(id: string): Resource {
  const r = resources.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown resource id "${id}" (src/data/resources.ts)`);
  return r;
}

/** The domain shown after the organization on each card, e.g. "artofproblemsolving.com". */
export const domainOf = (url: string): string => new URL(url).hostname.replace(/^www\./, '');

/**
 * Problem sets and handouts from EBMA's own events (placeholder `resources.handouts`).
 * While this list is empty the page shows one sample row with a placeholder chip.
 * Add entries soonest-last, e.g.
 *   { title: 'Fall Problem-Solving Day: problems and solutions', date: '2026-10-17', href: '/handouts/fall-2026.pdf' }
 * and put the PDFs in public/handouts/.
 */
export interface Handout {
  title: string;
  /** ISO date of the event, YYYY-MM-DD. */
  date?: string;
  /** A PDF under public/handouts/ or an external link. */
  href: string;
  /** Optional one-line note, e.g. "with full solutions". */
  note?: string;
}

export const handouts: Handout[] = [];
