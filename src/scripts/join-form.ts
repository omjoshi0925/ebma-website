/**
 * Progressive enhancement for the "Join EBMA" form (src/components/JoinForm.astro).
 *
 * Without this script the form is a plain HTML POST to /api/join with native `required`
 * validation. With it: the same validation the server runs (shared/join.ts), inline errors and
 * an error summary that takes focus, a fetch() submit that keeps the reader on the page, server
 * field errors mapped back onto the fields, and a focused success message.
 */
import { INTERESTS, LIMITS, ROLES, validateJoin, type JoinErrors, type JoinField, type JoinInput, type Role } from '../../shared/join';

const FIELDS: JoinField[] = ['name', 'email', 'role', 'grade', 'school', 'city', 'interests', 'message', 'consent'];

/* ---------- what the form says, by role ---------- */

/** A line of copy that may hold links: plain strings and { href, text } pieces, in order. */
export type Rich = (string | { href: string; text: string })[];

export interface RoleCopy {
  /** Under Name. Empty hides it. */
  nameHint: string;
  /** null hides the Grade field and leaves it out of the submission. */
  gradeLabel: string | null;
  gradeHint: string;
  schoolLabel: string;
  schoolHint: string;
  messageLabel: string;
  messageHint: string;
  /** A line at the top of the form, for readers who came in with this role. Empty for none. */
  note: Rich;
  /** Show the intro's "Filling this in for a child?" line (not for sponsors or teachers). */
  family: boolean;
  /** The success message's "while you wait" line. */
  next: Rich;
}

/**
 * What the page is built with, so all that a reader without JavaScript (or who hasn't chosen a
 * role yet) sees. Every hint has to work for every role at once.
 */
export const NEUTRAL_COPY: RoleCopy = {
  nameHint: '',
  gradeLabel: 'Grade',
  gradeHint: 'Yours, your child’s, or the grade you teach.',
  schoolLabel: 'School or organization',
  schoolHint: 'Your school, your child’s, or the organization you represent.',
  messageLabel: 'Message',
  messageHint: 'A question, what you’re hoping for, or anything we should know. Parents: tell us a little about your child.',
  note: [],
  family: true,
  next: ['While you wait, ', { href: '/resources/#problems', text: 'try a problem' }, ' or ', { href: '/events/', text: 'see what’s coming up' }, '.'],
};

/** Once a role is chosen (or preselected by ?role=), the parts that differ from the neutral copy. */
const ROLE_COPY: Record<Role, Partial<RoleCopy>> = {
  student: {
    gradeLabel: 'Your grade',
    gradeHint: 'Your grade this school year.',
    schoolLabel: 'Your school',
    schoolHint: 'Where you go to school.',
    messageHint: 'A question, or the kind of math you enjoy.',
  },
  parent: {
    nameHint: 'Your own name. Tell us about your child in the fields below.',
    gradeLabel: 'Your child’s grade',
    gradeHint: 'More than one child? Say so in your message.',
    schoolLabel: 'Your child’s school',
    schoolHint: 'Where your child goes to school.',
    messageLabel: 'Tell us about your child',
    messageHint: 'What they enjoy, what they’d like to try, and any question you have.',
    next: ['While you wait, ', { href: '/about/#faq', text: 'read the questions parents ask' }, ' or ', { href: '/events/', text: 'see what’s coming up' }, '.'],
  },
  educator: {
    gradeLabel: 'Grade you teach',
    gradeHint: 'The main one. Mention any others in your message.',
    schoolLabel: 'Your school',
    schoolHint: 'Where you teach.',
    messageHint: 'What your students need, and what you have in mind.',
    family: false,
    note: ['Writing as a teacher? This form is the first step; ', { href: '#schools', text: '§3 explains how partnering works' }, '.'],
    next: ['While you wait, ', { href: '#schools', text: 'read how partnering works' }, ' or ', { href: '/events/', text: 'see what’s coming up' }, '.'],
  },
  volunteer: {
    gradeLabel: 'Your grade',
    gradeHint: 'Only if you’re a student yourself.',
    schoolLabel: 'School or workplace',
    schoolHint: 'Where you study or work, if you’d like to say.',
    messageHint: 'How you’d like to help (coaching, writing problems, checking answers, or running an event) and roughly when you’re free.',
  },
  sponsor: {
    gradeLabel: null,
    schoolLabel: 'Organization',
    schoolHint: 'The business, school, or group you represent.',
    messageHint: 'What you’d like to support: a competition, an event space, prizes, printing, or something else.',
    family: false,
    note: ['Sponsoring or partnering? Tell us your organization below. How support works is on ', { href: '/sponsors/', text: 'Sponsors & Partners' }, '.'],
    next: ['While you wait, ', { href: '/sponsors/#uses', text: 'see where support goes' }, '.'],
  },
  other: {
    messageHint: 'Anything at all: a question, an idea, or just hello.',
  },
};

const isRole = (v: string | null | undefined): v is Role => ROLES.some((r) => r.value === v);
const copyFor = (role: string | null | undefined): RoleCopy => ({ ...NEUTRAL_COPY, ...(isRole(role) ? ROLE_COPY[role] : {}) });

/** Fills an element with a Rich line (links built as elements, never parsed from HTML). */
function renderRich(el: HTMLElement, parts: Rich): void {
  el.replaceChildren(
    ...parts.map((p) => {
      if (typeof p === 'string') return p;
      const a = document.createElement('a');
      a.href = p.href;
      a.textContent = p.text;
      return a;
    }),
  );
}

/* ---------- failures ---------- */

const SEND_FAILED = 'We couldn’t send your form';
/** Our own wording for each failure. The server's `message` is for the no-JavaScript error page. */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'We couldn’t read that form. Please reload the page and try again.',
  403: 'This form can only be sent from the EBMA website. Please reload the page and try again.',
  429: 'We’ve received a lot of forms from your network in the last few minutes (schools and campuses often share one connection). Please wait a few minutes, then try again, or email us instead (see §4, Get in touch).',
  503: 'The form isn’t taking messages right now. Please email us instead (see §4, Get in touch).',
};
/** The server says which limit a 429 hit (functions/api/join.ts). */
const RATE_MESSAGES: Record<string, string> = {
  'rate-email':
    'We already have several forms from this email address from the last few minutes, so your message has reached us. To add something, please wait about 10 minutes and send it again, or email us instead (see §4, Get in touch).',
};
const FALLBACK_MESSAGE = 'Something went wrong on our end. Please try again in a minute, or email us instead (see §4, Get in touch).';
const OFFLINE_MESSAGE = 'We couldn’t reach our server. Check your internet connection and try again, or email us instead (see §4, Get in touch).';

/** Preselect an interest that matches the role a page linked in with (e.g. Sponsors → partnering). */
const ROLE_INTEREST: Partial<Record<string, (typeof INTERESTS)[number]['value']>> = {
  sponsor: 'partnering',
  volunteer: 'volunteering',
};

export function mountJoinForm(form: HTMLFormElement): void {
  const root = form.closest<HTMLElement>('[data-join]') ?? form.parentElement!;
  const summary = root.querySelector<HTMLElement>('#join-error-summary')!;
  const summaryHeading = summary.querySelector<HTMLElement>('[data-summary-heading]')!;
  const summaryMsg = summary.querySelector<HTMLElement>('[data-summary-msg]')!;
  const summaryList = summary.querySelector<HTMLUListElement>('[data-summary-list]')!;
  const success = root.querySelector<HTMLElement>('#join-success')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const buttonLabel = button.querySelector<HTMLElement>('[data-btn-label]')!;
  const status = form.querySelector<HTMLElement>('[data-status]');
  const elapsed = form.querySelector<HTMLInputElement>('input[name="elapsed_ms"]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const idleLabel = buttonLabel.textContent ?? 'Send';
  const scrollBehavior = (): ScrollBehavior => (reduceMotion.matches ? 'auto' : 'smooth');

  /** Fields whose error is currently on screen. */
  const shown = new Map<JoinField, string>();
  let sending = false;

  // Our validation replaces the browser's; the `required` attributes stay for no-JS readers.
  form.noValidate = true;

  // The server's fill-time check gets a duration from this page's monotonic clock, never a
  // timestamp, so a device clock that is off can't make a person look like a bot.
  const openedAt = performance.now();

  /* ---------- the chosen role reshapes labels and hints ---------- */
  const copySlot = (key: keyof RoleCopy) => root.querySelector<HTMLElement>(`[data-copy="${key}"]`);
  const gradeField = form.querySelector<HTMLElement>('.jf-field[data-field="grade"]');
  const gradeSelect = form.querySelector<HTMLSelectElement>('select[name="grade"]');
  const checkedRole = () => form.querySelector<HTMLInputElement>('input[name="role"]:checked')?.value ?? null;
  let currentCopy: RoleCopy = NEUTRAL_COPY;

  const applyRoleCopy = () => {
    const copy = copyFor(checkedRole());
    currentCopy = copy;
    for (const key of ['gradeHint', 'schoolLabel', 'schoolHint', 'messageLabel', 'messageHint'] as const) {
      const el = copySlot(key);
      if (el && el.textContent !== copy[key]) el.textContent = copy[key];
    }
    const nameHint = copySlot('nameHint');
    if (nameHint) {
      nameHint.textContent = copy.nameHint;
      nameHint.hidden = !copy.nameHint;
    }
    const note = copySlot('note');
    if (note) {
      renderRich(note, copy.note);
      note.hidden = copy.note.length === 0;
    }
    const family = copySlot('family');
    if (family) family.hidden = !copy.family;
    // No grade for sponsors: the field goes, and a disabled select is left out of the submission.
    const noGrade = copy.gradeLabel === null;
    const gradeLabel = copySlot('gradeLabel');
    if (gradeLabel && copy.gradeLabel) gradeLabel.textContent = copy.gradeLabel;
    if (gradeField) gradeField.hidden = noGrade;
    if (gradeSelect) gradeSelect.disabled = noGrade;
    if (noGrade && shown.has('grade')) setError('grade', undefined);
  };

  /* ---------- ?role=sponsor → preselect the matching radio ---------- */
  const applyRoleFromURL = () => {
    const wanted = new URLSearchParams(location.search).get('role');
    if (isRole(wanted)) {
      const radio = form.querySelector<HTMLInputElement>(`input[name="role"][value="${wanted}"]`);
      if (radio) radio.checked = true;
      const interest = ROLE_INTEREST[wanted];
      const box = interest && form.querySelector<HTMLInputElement>(`input[name="interests"][value="${interest}"]`);
      if (box) box.checked = true;
    }
    applyRoleCopy();
  };

  /* ---------- reading the form ---------- */
  const read = (): JoinInput => {
    const data = new FormData(form);
    const out: JoinInput = {};
    for (const key of new Set(data.keys())) {
      const all = data.getAll(key).filter((v): v is string => typeof v === 'string');
      out[key] = key === 'interests' ? all : all[0];
    }
    return out;
  };
  const controls = (field: JoinField) =>
    [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${field}"]`)];
  // Scoped to the field containers: the summary links (inside the form too) must never match.
  const wrapper = (field: JoinField) => form.querySelector<HTMLElement>(`.jf-field[data-field="${field}"]`);
  const target = (field: JoinField) => document.getElementById(`join-${field}`);

  /* ---------- showing and clearing errors ---------- */
  const setError = (field: JoinField, message: string | undefined) => {
    const out = document.getElementById(`join-${field}-error`);
    if (out) {
      out.replaceChildren();
      if (message) {
        const prefix = document.createElement('span');
        prefix.className = 'sr-only';
        prefix.textContent = 'Error: ';
        out.append(prefix, message);
      }
    }
    // Always an explicit value: removing it would let Chrome fall back to native validity.
    for (const c of controls(field)) c.setAttribute('aria-invalid', message ? 'true' : 'false');
    wrapper(field)?.classList.toggle('is-invalid', Boolean(message));
    if (message) shown.set(field, message);
    else shown.delete(field);
  };

  const renderErrors = (errors: JoinErrors) => {
    for (const field of FIELDS) setError(field, errors[field]);
  };

  const renderSummaryList = () => {
    summaryList.replaceChildren(
      ...FIELDS.filter((f) => shown.has(f)).map((field) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#join-${field}`;
        a.textContent = shown.get(field)!;
        a.dataset.target = field;
        li.append(a);
        return li;
      }),
    );
  };

  const showSummary = (heading: string, message?: string) => {
    summaryHeading.textContent = heading;
    summaryMsg.textContent = message ?? '';
    summaryMsg.hidden = !message;
    renderSummaryList();
    summary.hidden = false;
    // Bring it to the top of the screen (under the sticky header), then focus it: focus alone
    // scrolls only as far as it must and can leave the summary at the bottom edge.
    summary.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
    summary.focus({ preventScroll: true });
  };

  const hideSummary = () => {
    summary.hidden = true;
    summaryList.replaceChildren();
    summaryMsg.hidden = true;
  };

  // Summary links move focus to the field and bring its label into view.
  summary.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-target]');
    if (!link) return;
    const field = link.dataset.target as JoinField;
    const el = target(field);
    if (!el) return;
    e.preventDefault();
    (wrapper(field) ?? el).scrollIntoView({ block: 'start', behavior: scrollBehavior() });
    el.focus({ preventScroll: true });
  });

  // Once a shown error is fixed, clear it (on input for text, on change/blur for the rest).
  const recheck = (field: JoinField, updateMessage: boolean) => {
    if (!shown.has(field)) return;
    const { errors } = validateJoin(read());
    const next = errors[field];
    if (!next) setError(field, undefined);
    else if (updateMessage && next !== shown.get(field)) setError(field, next);
    else return;
    if (!summary.hidden) {
      if (shown.size === 0 && summaryMsg.hidden) hideSummary();
      else renderSummaryList();
    }
  };
  const fieldOf = (el: EventTarget | null): JoinField | null => {
    const name = el instanceof HTMLElement ? el.getAttribute('name') : null;
    return name && (FIELDS as string[]).includes(name) ? (name as JoinField) : null;
  };
  form.addEventListener('input', (e) => {
    const field = fieldOf(e.target);
    if (field) recheck(field, false);
  });
  form.addEventListener('change', (e) => {
    const field = fieldOf(e.target);
    if (field === 'role') applyRoleCopy();
    if (field) recheck(field, true);
  });
  form.addEventListener('focusout', (e) => {
    const field = fieldOf(e.target);
    if (field) recheck(field, true);
  });

  /* ---------- message character count ---------- */
  // The page says "Up to 2,000 characters", which stays true without JavaScript; the live count
  // replaces it here.
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  const count = form.querySelector<HTMLElement>('[data-count-for="join-message"]');
  const countNum = document.createElement('span');
  count?.replaceChildren(countNum, ` of ${LIMITS.message.toLocaleString('en-US')} characters`);
  const countLive = form.querySelector<HTMLElement>('[data-count-live]');
  let lastBand = -1;
  const updateCount = () => {
    if (!message || !count) return;
    const used = message.value.length;
    const left = LIMITS.message - used;
    countNum.textContent = used.toLocaleString('en-US');
    count.classList.toggle('is-near', left <= 200);
    // Announce only when crossing a threshold, not on every keystroke.
    const band = left <= 0 ? 0 : left <= 50 ? 1 : left <= 200 ? 2 : 3;
    if (countLive && band !== lastBand && lastBand !== -1 && band < 3) {
      countLive.textContent = left <= 0 ? 'You’ve reached the character limit.' : `${left} characters left.`;
    }
    lastBand = band;
  };
  message?.addEventListener('input', updateCount);
  updateCount();

  applyRoleFromURL();
  // A restored page (Back/Forward) may come back with a different role checked.
  addEventListener('pageshow', applyRoleCopy);

  /** Back to a blank form (plus any ?role= preselection), with no errors showing. */
  const clearForm = () => {
    form.reset();
    applyRoleFromURL();
    renderErrors({});
    hideSummary();
    lastBand = -1;
    updateCount();
  };

  /* ---------- sending ---------- */
  // aria-disabled rather than `disabled`: disabling the focused button would drop keyboard
  // focus to <body> for the whole request. The `sending` flag blocks a second submit.
  const setSending = (on: boolean) => {
    sending = on;
    if (on) button.setAttribute('aria-disabled', 'true');
    else button.removeAttribute('aria-disabled');
    buttonLabel.textContent = on ? 'Sending…' : idleLabel;
    form.toggleAttribute('aria-busy', on);
    if (status) status.textContent = on ? 'Sending your form…' : '';
  };

  const showSuccess = (email: string) => {
    const out = success.querySelector<HTMLElement>('[data-success-email]');
    if (out && email) out.textContent = email;
    // The "while you wait" line suits whoever just wrote (read before the form is cleared).
    const next = success.querySelector<HTMLElement>('[data-success-next]');
    if (next) renderRich(next, currentCopy.next);
    // Empty the form now, so Back/Forward can't bring it back filled in and invite a duplicate.
    clearForm();
    form.hidden = true;
    success.hidden = false;
    success.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;

    const input = read();
    const { values, errors } = validateJoin(input);
    renderErrors(errors);
    if (Object.keys(errors).length > 0) {
      showSummary('Please check the form');
      return;
    }
    hideSummary();

    if (elapsed) elapsed.value = String(Math.max(0, Math.round(performance.now() - openedAt)));
    setSending(true);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        credentials: 'same-origin',
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; errors?: JoinErrors; code?: string } | null;
      // Only our API's own `{ ok: true }` is a success: a captive portal or proxy page is not.
      if (res.ok && data?.ok === true) {
        showSuccess(values.email);
      } else if (res.status === 422 && data?.errors) {
        renderErrors(data.errors);
        showSummary('Please check the form');
      } else {
        const byCode = res.status === 429 && data?.code ? RATE_MESSAGES[data.code] : undefined;
        showSummary(SEND_FAILED, byCode ?? STATUS_MESSAGES[res.status] ?? FALLBACK_MESSAGE);
      }
    } catch {
      showSummary(SEND_FAILED, OFFLINE_MESSAGE);
    } finally {
      setSending(false);
    }
  });

  /* ---------- "Send another response" ---------- */
  success.querySelector<HTMLButtonElement>('[data-join-again]')?.addEventListener('click', () => {
    clearForm();
    success.hidden = true;
    form.hidden = false;
    document.getElementById('join-name')?.focus();
  });
}
