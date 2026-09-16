const assert = require('assert');
const { SOURCE, normalizeInternationalPhone, toExportLead } = require('../lib/export-rfq');

assert.strictEqual(normalizeInternationalPhone('+233 24 123 4567'), '233241234567');
assert.strictEqual(normalizeInternationalPhone('123'), null);

const mapped = toExportLead({
  company: 'Acme Distribution Ltd',
  contact: 'Ama Mensah',
  country: 'Ghana',
  email: 'ama@acme.example',
  phone: '+233 24 123 4567',
  interests: ['Private Label', 'Bulk Supply'],
  product: 'Home hygiene products',
  quantity: '10,000 units/month',
  market: 'Ghana',
  packaging: 'Retail-ready cartons',
  timeline: 'Q3 2026',
  notes: 'Connection test',
});

assert.deepStrictEqual(mapped.errors, []);
assert.strictEqual(mapped.lead.source, SOURCE);
assert.strictEqual(mapped.lead.companyName, 'Acme Distribution Ltd');
assert.strictEqual(mapped.lead.mobile, '233241234567');
assert.ok(mapped.lead.needs.includes('Export RFQ'));
assert.ok(mapped.lead.needs.length <= 200);

console.log('export-rfq mapping tests passed');
