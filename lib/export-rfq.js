const { splitName } = require('./home-inquiry');

const SOURCE = 'Website-Exports';
const NEED_MAX = 200;

function clip(value, max) {
  return String(value || '').trim().slice(0, max);
}

function normalizeInternationalPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 ? digits : null;
}

function buildNeed(input) {
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const entries = [
    'Export RFQ',
    `Company: ${input.company}`,
    `Country: ${input.country}`,
    interests.length ? `Type: ${interests.join(', ')}` : '',
    input.product ? `Product: ${input.product}` : '',
    input.quantity ? `Quantity: ${input.quantity}` : '',
    input.market ? `Market: ${input.market}` : '',
    input.packaging ? `Packaging: ${input.packaging}` : '',
    input.timeline ? `Timeline: ${input.timeline}` : '',
    input.website ? `Website: ${input.website}` : '',
    input.fileName ? `File: ${input.fileName}` : '',
    input.notes ? `Notes: ${input.notes}` : '',
  ].filter(Boolean);
  return clip(entries.join(' | '), NEED_MAX);
}

function toExportLead(input) {
  const company = clip(input.company, 100);
  const contact = clip(input.contact, 100);
  const country = clip(input.country, 80);
  const email = clip(input.email, 120);
  const mobile = normalizeInternationalPhone(input.phone);
  const { firstName, lastName } = splitName(contact);
  const errors = [];

  if (!company) errors.push('Enter your company name.');
  if (!contact || !lastName) errors.push('Enter a contact person.');
  if (!country) errors.push('Enter your country.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Enter a valid business email.');
  if (!mobile) errors.push('Enter a valid WhatsApp or phone number.');

  return {
    errors,
    lead: errors.length
      ? null
      : {
          companyName: company,
          title: '',
          firstName,
          lastName,
          email,
          mobile,
          designation: '',
          needs: buildNeed({ ...input, company, country }),
          source: SOURCE,
        },
  };
}

module.exports = { SOURCE, normalizeInternationalPhone, buildNeed, toExportLead };
