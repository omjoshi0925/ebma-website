import { define } from '../../lib/placeholders';

/** Placeholders used on the Get Involved page (/get-involved/) and its thank-you page. */
export default define({
  'get-involved.response-time': {
    label: 'Typical reply time',
    note: 'How long people should expect to wait for a reply after sending the join form or an email, so nobody wonders whether it arrived. Shown in the footer, in the Contact section, in the form’s success message, and on the thank-you page. Pick something you can keep during busy weeks.',
    pages: ['All pages (footer)', '/get-involved/', '/get-involved/thanks/'],
    example: 'three school days',
    value: '3–5 days',
  },
});
