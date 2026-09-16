const SOURCE = 'Website-Home';
const NEED_MAX = 200;
const NAME_MAX = 15;

function clip(value, max) {
  return String(value || '').trim().slice(0, max);
}

function normalizeMobile(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
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

function buildNeed({ interest, location, message }) {
  const parts = [interest, location, message]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return clip(parts.join(' | '), NEED_MAX);
}

function toLeadFields(input) {
  const fullName = String(input.fullName || '').trim();
  const interest = String(input.interest || '').trim();
  const location = String(input.location || '').trim();
  const message = String(input.message || '').trim();
  const mobile = normalizeMobile(input.mobile || input.phone);
  const { firstName, lastName } = splitName(fullName);

  const errors = [];
  if (!interest) errors.push('Select what you are interested in.');
  if (!fullName) errors.push('Enter your name.');
  if (!lastName) errors.push('Enter your name.');
  if (!mobile) {
    errors.push('Enter a 10-digit Indian mobile, or +91 followed by 10 digits.');
  }
  if (!location) errors.push('Enter your city / country.');

  return {
    errors,
    lead: errors.length
      ? null
      : {
          companyName: '',
          title: '',
          firstName,
          lastName,
          email: '',
          mobile,
          designation: '',
          needs: buildNeed({ interest, location, message }),
          source: SOURCE,
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
  buildNeed,
  toLeadFields,
  interpretBiziverseResponse,
};
