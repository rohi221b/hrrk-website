const SOURCE = 'Website-Home';
const NEED_MAX = 400;
const NAME_MAX = 15;

function clip(value, max) {
  return String(value || '').trim().slice(0, max);
}

/**
 * Accepts Indian 10-digit, +91 prefix, or any international number (7–15 digits).
 * Stored as digits only; non-Indian callers won't fail validation.
 */
function normalizeMobile(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length >= 7 && digits.length <= 15) return digits;
  return null;
}

function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: '', lastName: clip(parts[0], NAME_MAX) };
  }
  const lastName = clip(parts[parts.length - 1], NAME_MAX);
  const firstName = clip(parts.slice(0, -1).join(' '), NAME_MAX);
  return { firstName, lastName };
}

/**
 * Accepts:
 *   "Mumbai"                    → city=Mumbai, state='', country='India'
 *   "Mumbai, India"             → city=Mumbai, state='', country='India'
 *   "Mumbai, Maharashtra, India"→ city=Mumbai, state='Maharashtra', country='India'
 * Always returns a valid object (never null) as long as input is non-empty.
 */
function parseLocation(raw) {
  const parts = String(raw || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;
  if (parts.length === 1) {
    return {
      city: clip(parts[0], 50),
      state: '',
      country: 'India',
    };
  }
  if (parts.length === 2) {
    return {
      city: clip(parts[0], 50),
      state: '',
      country: clip(parts[1], 50),
    };
  }
  return {
    city: clip(parts[0], 50),
    state: clip(parts[1], 50),
    country: clip(parts.slice(2).join(', '), 50),
  };
}

/**
 * Builds the Biziverse `needs` field from all available context fields.
 */
function buildNeed({ interest, product, quantity, message }) {
  const parts = [
    interest && `Interest: ${interest}`,
    product  && `Product: ${product}`,
    quantity && `Qty: ${quantity}`,
    message,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return clip(parts.join(' | '), NEED_MAX);
}

function toLeadFields(input) {
  const fullName = String(input.fullName  || '').trim();
  const interest = String(input.interest  || '').trim();
  const location = String(input.location  || '').trim();
  const message  = String(input.message   || '').trim();
  const company  = String(input.company   || '').trim();
  const email    = String(input.email     || '').trim();
  const product  = String(input.product   || '').trim();
  const quantity = String(input.quantity  || '').trim();
  const mobile   = normalizeMobile(input.mobile || input.phone);
  const address  = parseLocation(location);
  const { firstName, lastName } = splitName(fullName);

  const errors = [];
  if (!interest) errors.push('Select what you are interested in.');
  if (!fullName)  errors.push('Enter your name.');
  if (!lastName)  errors.push('Enter your name.');
  if (!mobile) {
    errors.push('Enter a valid phone or WhatsApp number (e.g. +91 98765 43210).');
  }
  if (!address || !address.city) {
    errors.push('Please enter your city name.');
  }

  return {
    errors,
    lead: errors.length
      ? null
      : {
          companyName: clip(company, 50),
          title: '',
          firstName,
          lastName,
          email: clip(email, 100),
          mobile,
          designation: '',
          city:    address.city,
          state:   address.state   || '',
          country: address.country || '',
          needs:   buildNeed({ interest, product, quantity, message }),
          source:  SOURCE,
        },
  };
}

function extractCode(parsed, text) {
  if (typeof parsed === 'number' && Number.isFinite(parsed)) return parsed;
  if (typeof parsed === 'string' && /^-?\d+$/.test(parsed.trim())) {
    return Number(parsed.trim());
  }
  if (parsed && typeof parsed === 'object') {
    const raw = parsed.code ?? parsed.Code ?? parsed.status ?? parsed.Status;
    if (raw !== undefined && raw !== null && raw !== '') {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
  }
  const fromText = String(text || '').match(/(?:^|[^\d-])(-1|305|200|201|202|203|500)(?:[^\d]|$)/);
  if (fromText) return Number(fromText[1]);
  return null;
}

function unwrapBiziversePayload(text) {
  const trimmed = String(text || '').trim();
  const xml = trimmed.match(/<string[^>]*>([\s\S]*?)<\/string>/i);
  let inner = xml ? xml[1].trim() : trimmed;
  inner = inner.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  let parsed = null;
  try {
    parsed = JSON.parse(inner);
  } catch {
    parsed = null;
  }
  if (parsed && typeof parsed === 'object' && parsed.d != null) {
    if (typeof parsed.d === 'string') {
      try {
        parsed = JSON.parse(parsed.d);
      } catch {
        parsed = parsed.d;
      }
    } else {
      parsed = parsed.d;
    }
  }
  return { inner, parsed };
}

function interpretBiziverseResponse(bodyText) {
  const { inner, parsed } = unwrapBiziversePayload(bodyText);
  const code = extractCode(parsed, inner);
  const message =
    (parsed && typeof parsed === 'object' && (parsed.message || parsed.Message)) ||
    inner.slice(0, 180);

  if (code === -1) return { ok: true, duplicate: false, code, message: message || 'Lead saved' };
  if (code === 305) return { ok: true, duplicate: true, code, message: message || 'Duplicate entry' };
  return {
    ok: false,
    duplicate: false,
    code,
    message: message || 'Biziverse did not save the Lead',
  };
}

module.exports = {
  SOURCE,
  normalizeMobile,
  splitName,
  parseLocation,
  buildNeed,
  toLeadFields,
  interpretBiziverseResponse,
};
