const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('chilled-water page has a resolvable API adapter and failure states', () => {
  const root = path.join(__dirname, '..', 'src');
  const page = fs.readFileSync(path.join(root, 'pages', 'ChilledWaterLoadShedPage.jsx'), 'utf8');
  const adapter = fs.readFileSync(path.join(root, 'services', 'api.js'), 'utf8');
  assert.match(page, /\.\.\/services\/api/);
  assert.match(page, /role="alert"/);
  assert.match(page, /Loading chilled-water events/);
  assert.match(adapter, /apiGet/);
  assert.match(adapter, /export default api/);
});
