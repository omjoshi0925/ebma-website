import { define } from '../../lib/placeholders';

/** Placeholders used on the Get Involved page (/get-involved/) and its thank-you page. */
export default define({
  'get-involved.response-time': {
    label: 'Typical reply time',
    note: 'How long people should expect to wait for a reply after sending the join form or an email, so nobody wonders whether it arrived. Shown in the Contact section, in the form’s success message, and on the thank-you page. Pick something you can keep during busy weeks.',
    pages: ['/get-involved/', '/get-involved/thanks/'],
    example: 'three school days',
    value: null,
  },
  'get-involved.schools-contact': {
    label: 'Schools contact (name and role)',
    note: 'The person teachers and school staff should talk to about partnering, e.g. a schools coordinator or an officer. If schools should simply use the general email, delete the “Who to talk to” line in the Schools & teachers section of src/pages/get-involved/index.astro.',
    pages: ['/get-involved/'],
    example: 'Alex Kim, schools coordinator',
    value: null,
  },
});
