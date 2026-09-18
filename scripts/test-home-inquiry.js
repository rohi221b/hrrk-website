const assert = require('assert');
const {
  normalizeMobile,
  splitName,
  parseLocation,
  buildNeed,
  toLeadFields,
  interpretBiziverseResponse,
  SOURCE,
} = require('../lib/home-inquiry');

assert.strictEqual(normalizeMobile('+91 98765 43210'), '9876543210');
assert.strictEqual(normalizeMobile('9876543210'), '9876543210');
assert.strictEqual(normalizeMobile('+971 50 123 4567'), '971501234567');

assert.deepStrictEqual(splitName('Rajesh Sharma'), { firstName: 'Rajesh', lastName: 'Sharma' });
assert.deepStrictEqual(splitName('Rajesh'), { firstName: '', lastName: 'Rajesh' });
assert.strictEqual(splitName('Mohammed Abdul Rahman Khan').firstName.length <= 15, true);
assert.strictEqual(splitName('Mohammed Abdul Rahman Khan').lastName, 'Khan');
assert.deepStrictEqual(parseLocation('Mumbai, Maharashtra, India'), {
  city: 'Mumbai', state: 'Maharashtra', country: 'India',
});
assert.deepStrictEqual(parseLocation('Mumbai, India'), {
  city: 'Mumbai', state: '', country: 'India',
});
assert.deepStrictEqual(parseLocation('Mumbai'), {
  city: 'Mumbai', state: '', country: 'India',
});
assert.strictEqual(parseLocation(''), null);

const mapped = toLeadFields({
  interest: 'Namrushii Industrixa (Manufacturing / OEM)',
  fullName: 'Rajesh Sharma',
  phone: '+91 98765 43210',
  location: 'Pune, Maharashtra, India',
  message: '50k caps, food-grade',
});
assert.strictEqual(mapped.errors.length, 0);
assert.strictEqual(mapped.lead.mobile, '9876543210');
assert.strictEqual(mapped.lead.email, '');
assert.strictEqual(mapped.lead.source, SOURCE);
assert.strictEqual(mapped.lead.city, 'Pune');
assert.strictEqual(mapped.lead.state, 'Maharashtra');
assert.strictEqual(mapped.lead.country, 'India');
assert.ok(mapped.lead.needs.includes('Namrushii'));
assert.ok(!mapped.lead.needs.includes('Pune'));
assert.ok(mapped.lead.needs.length <= 200);

assert.strictEqual(interpretBiziverseResponse('<string xmlns="http://tempuri.org/">-1</string>').ok, true);
assert.strictEqual(interpretBiziverseResponse('{"code":305,"message":"Duplicate entry"}').duplicate, true);
assert.strictEqual(interpretBiziverseResponse('{"d":{"code":200,"message":"Invalid access"}}').ok, false);

console.log('home-inquiry mapping tests passed');
