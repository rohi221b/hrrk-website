const { toExportLead } = require('../lib/export-rfq');
const { interpretBiziverseResponse } = require('../lib/home-inquiry');

const BIZIVERSE_URL = 'https://biziverse.com/PremiumAPI.asmx/setAPI';

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string' && req.body) return Promise.resolve(JSON.parse(req.body));
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (error) {
        reject(error);
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

  const { errors, lead } = toExportLead(body);
  if (errors.length || !lead) {
    send(res, 400, { ok: false, error: errors[0] || 'Invalid export requirement.' });
    return;
  }

  const apiKey = process.env.BIZIVERSE_API_KEY;
  if (!apiKey) {
    console.error('Export RFQ: BIZIVERSE_API_KEY is not set');
    send(res, 503, { ok: false, error: 'Your export requirement could not be sent. Please try again later.' });
    return;
  }

  const apiParams = JSON.stringify([{ moduleID: 25, actionType: 'setLead', data: JSON.stringify([lead]) }]);
  let upstream;
  try {
    upstream = await fetch(BIZIVERSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ apiKey, apiParams }).toString(),
    });
  } catch (error) {
    console.error('Export RFQ: Biziverse network error', error);
    send(res, 502, { ok: false, error: 'Your export requirement could not be sent. Please try again later.' });
    return;
  }

  const result = interpretBiziverseResponse(await upstream.text());
  if (result.ok) {
    send(res, 200, { ok: true, duplicate: Boolean(result.duplicate) });
    return;
  }

  console.error('Export RFQ: Biziverse rejected Lead', { httpStatus: upstream.status, code: result.code, message: result.message });
  send(res, 502, { ok: false, error: 'Your export requirement could not be sent. Please try again later.' });
};
