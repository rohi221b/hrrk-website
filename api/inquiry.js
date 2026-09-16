const {
  toLeadFields,
  interpretBiziverseResponse,
} = require('../lib/home-inquiry');

const BIZIVERSE_URL = 'https://biziverse.com/PremiumAPI.asmx/setAPI';

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string' && req.body) {
    return Promise.resolve(JSON.parse(req.body));
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    send(res, 405, { ok: false, error: 'Method not allowed.' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    send(res, 400, { ok: false, error: 'Invalid request.' });
    return;
  }

  const { errors, lead } = toLeadFields(body);
  if (errors.length || !lead) {
    send(res, 400, { ok: false, error: errors[0] || 'Invalid inquiry.' });
    return;
  }

  const apiKey = process.env.BIZIVERSE_API_KEY;
  if (!apiKey) {
    console.error('Home Inquiry: BIZIVERSE_API_KEY is not set');
    send(res, 503, { ok: false, error: 'Inquiry could not be sent. Please try again later.' });
    return;
  }

  const apiParams = JSON.stringify([
    {
      moduleID: 25,
      actionType: 'setLead',
      data: JSON.stringify([lead]),
    },
  ]);

  let upstream;
  try {
    upstream = await fetch(BIZIVERSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ apiKey, apiParams }).toString(),
    });
  } catch (err) {
    console.error('Home Inquiry: Biziverse network error', err);
    send(res, 502, { ok: false, error: 'Inquiry could not be sent. Please try again later.' });
    return;
  }

  const text = await upstream.text();
  const result = interpretBiziverseResponse(text);

  if (result.ok) {
    if (result.duplicate) {
      console.info('Home Inquiry: duplicate mobile, treating as success');
    } else {
      console.info('Home Inquiry: Lead saved');
    }
    send(res, 200, { ok: true, duplicate: Boolean(result.duplicate) });
    return;
  }

  console.error('Home Inquiry: Biziverse rejected Lead', {
    httpStatus: upstream.status,
    code: result.code,
    message: result.message,
  });
  send(res, 502, { ok: false, error: 'Inquiry could not be sent. Please try again later.' });
};
