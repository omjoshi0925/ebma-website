/**
 * Progressive enhancement for the "Join EBMA" form (src/components/JoinForm.astro).
 *
 * Without this script the form is a plain HTML POST to /api/join with native `required`
 * validation. With it: the same validation the server runs (shared/join.ts), inline errors and
 * an error summary that takes focus, a fetch() submit that keeps the reader on the page, server
 * field errors mapped back onto the fields, and a focused success message.
 */
import { INTERESTS, LIMITS, ROLES, validateJoin, type JoinErrors, type JoinField, type JoinInput } from '../../shared/join';

const FIELDS: JoinField[] = ['name', 'email', 'role', 'grade', 'school', 'city', 'interests', 'message', 'consent'];

const SEND_FAILED = 'We couldn’t send your form';
const STATUS_MESSAGES: Record<number, string> = {
  403: 'This form can only be sent from the EBMA website. Please reload the page and try again.',
  429: 'We’ve received several forms from you in the last few minutes. Please wait a little while, then try again.',
};
const FALLBACK_MESSAGE = 'Something went wrong on our end. Please try again in a minute, or write to us directly (see Contact, below).';
const OFFLINE_MESSAGE = 'We couldn’t reach our server. Check your internet connection and try again, or write to us directly (see Contact, below).';

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
  const startedAt = form.querySelector<HTMLInputElement>('input[name="started_at"]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const idleLabel = buttonLabel.textContent ?? 'Send';

  /** Fields whose error is currently on screen. */
  const shown = new Map<JoinField, string>();
  let sending = false;

  // Our validation replaces the browser's; the `required` attributes stay for no-JS readers.
  form.noValidate = true;
  const stamp = () => {
    if (startedAt) startedAt.value = String(Date.now());
  };
  stamp();

  /* ---------- ?role=sponsor → preselect the matching radio ---------- */
  const wanted = new URLSearchParams(location.search).get('role');
  if (wanted && ROLES.some((r) => r.value === wanted)) {
    const radio = form.querySelector<HTMLInputElement>(`input[name="role"][value="${wanted}"]`);
    if (radio) radio.checked = true;
    const interest = ROLE_INTEREST[wanted];
    const box = interest && form.querySelector<HTMLInputElement>(`input[name="interests"][value="${interest}"]`);
    if (box) box.checked = true;
  }

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
  const wrapper = (field: JoinField) => form.querySelector<HTMLElement>(`[data-field="${field}"]`);
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
    for (const c of controls(field)) {
      if (message) c.setAttribute('aria-invalid', 'true');
      else c.removeAttribute('aria-invalid');
    }
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
        a.dataset.field = field;
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
    summary.focus();
  };

  const hideSummary = () => {
    summary.hidden = true;
    summaryList.replaceChildren();
    summaryMsg.hidden = true;
  };

  // Summary links move focus to the field and bring its label into view.
  summary.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-field]');
    if (!link) return;
    const field = link.dataset.field as JoinField;
    const el = target(field);
    if (!el) return;
    e.preventDefault();
    (wrapper(field) ?? el).scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
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
    if (field) recheck(field, true);
  });
  form.addEventListener('focusout', (e) => {
    const field = fieldOf(e.target);
    if (field) recheck(field, true);
  });

  /* ---------- message character count ---------- */
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  const count = form.querySelector<HTMLElement>('[data-count-for="join-message"]');
  const countNum = count?.querySelector<HTMLElement>('[data-count]');
  const countLive = form.querySelector<HTMLElement>('[data-count-live]');
  let lastBand = -1;
  const updateCount = () => {
    if (!message || !count || !countNum) return;
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

  /* ---------- sending ---------- */
  const setSending = (on: boolean) => {
    sending = on;
    button.disabled = on;
    buttonLabel.textContent = on ? 'Sending…' : idleLabel;
    form.toggleAttribute('aria-busy', on);
    if (status) status.textContent = on ? 'Sending your form…' : '';
  };

  const showSuccess = (email: string) => {
    const out = success.querySelector<HTMLElement>('[data-success-email]');
    if (out && email) out.textContent = email;
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

    setSending(true);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        credentials: 'same-origin',
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; errors?: JoinErrors; message?: string } | null;
      if (res.ok && data?.ok !== false) {
        showSuccess(values.email);
      } else if (res.status === 422 && data?.errors) {
        renderErrors(data.errors);
        showSummary('Please check the form');
      } else {
        showSummary(SEND_FAILED, data?.message ?? STATUS_MESSAGES[res.status] ?? FALLBACK_MESSAGE);
      }
    } catch {
      showSummary(SEND_FAILED, OFFLINE_MESSAGE);
    } finally {
      setSending(false);
    }
  });

  /* ---------- "Send another response" ---------- */
  success.querySelector<HTMLButtonElement>('[data-join-again]')?.addEventListener('click', () => {
    form.reset();
    renderErrors({});
    hideSummary();
    stamp();
    lastBand = -1;
    updateCount();
    success.hidden = true;
    form.hidden = false;
    document.getElementById('join-name')?.focus();
  });

  // Coming back through the back/forward cache: restart the fill timer.
  addEventListener('pageshow', (e) => {
    if (e.persisted) stamp();
  });
}
