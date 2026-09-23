/**
 * Join-form contract shared by the browser (progressive enhancement in
 * src/scripts/join-form.ts) and the server (functions/api/join.ts), so both
 * sides validate with exactly the same rules and messages.
 */

export const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent or guardian' },
  { value: 'educator', label: 'Teacher or school staff' },
  { value: 'volunteer', label: 'Volunteer or mentor' },
  { value: 'sponsor', label: 'Sponsor or partner' },
  { value: 'other', label: 'Something else' },
] as const;

export const GRADES = [
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
  { value: 'other', label: 'Other / not in school' },
] as const;

export const INTERESTS = [
  { value: 'events', label: 'Competitions and events' },
  { value: 'resources', label: 'Study resources' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'partnering', label: 'Partnering or sponsoring' },
  { value: 'updates', label: 'Email updates' },
] as const;

export const LIMITS = {
  name: 120,
  email: 254,
  school: 120,
  city: 80,
  message: 2000,
} as const;

export type JoinField =
  | 'name'
  | 'email'
  | 'role'
  | 'grade'
  | 'school'
  | 'city'
  | 'interests'
  | 'message'
  | 'consent';

export interface JoinValues {
  name: string;
  email: string;
  role: string;
  grade: string;
  school: string;
  city: string;
  interests: string[];
  message: string;
}

export type JoinErrors = Partial<Record<JoinField, string>>;

/** Raw input as it arrives from FormData or JSON: strings, string arrays, or missing. */
export type JoinInput = Record<string, string | string[] | undefined>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const one = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] ?? '' : v ?? '').replace(/\s+/g, ' ').trim();

const many = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v : v ? [v] : []).map((s) => s.trim()).filter(Boolean);

const has = (list: readonly { value: string }[], value: string) =>
  list.some((item) => item.value === value);

export function validateJoin(input: JoinInput): { values: JoinValues; errors: JoinErrors } {
  // The message keeps its line breaks; every other field is collapsed to one line.
  const rawMessage = Array.isArray(input.message) ? input.message[0] ?? '' : input.message ?? '';
  const values: JoinValues = {
    name: one(input.name),
    email: one(input.email).toLowerCase(),
    role: one(input.role),
    grade: one(input.grade),
    school: one(input.school),
    city: one(input.city),
    interests: [...new Set(many(input.interests))],
    message: rawMessage.replace(/\r\n?/g, '\n').trim(),
  };
  const errors: JoinErrors = {};

  if (!values.name) errors.name = 'Please enter your name.';
  else if (values.name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;

  if (!values.email) errors.email = 'Please enter your email address.';
  else if (values.email.length > LIMITS.email || !EMAIL_RE.test(values.email))
    errors.email = 'Please enter a valid email address, like name@example.com.';

  if (!values.role) errors.role = 'Please tell us who you are.';
  else if (!has(ROLES, values.role)) errors.role = 'Please choose one of the listed options.';

  if (values.grade && !has(GRADES, values.grade)) errors.grade = 'Please choose a grade from the list.';

  if (values.school.length > LIMITS.school) errors.school = `Please keep this under ${LIMITS.school} characters.`;
  if (values.city.length > LIMITS.city) errors.city = `Please keep this under ${LIMITS.city} characters.`;

  if (values.interests.some((i) => !has(INTERESTS, i))) errors.interests = 'Please choose from the listed interests.';

  if (values.message.length > LIMITS.message)
    errors.message = `Please keep your message under ${LIMITS.message} characters (it is ${values.message.length}).`;

  const consent = one(input.consent).toLowerCase();
  if (!['yes', 'on', 'true', '1'].includes(consent))
    errors.consent = 'Please confirm so we can reply to you.';

  return { values, errors };
}
