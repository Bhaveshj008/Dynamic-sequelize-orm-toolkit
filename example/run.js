require('module-alias/register'); require('dotenv').config();
const svc = require('@services/getProductDetailService');
(async () => { try {
  const id = process.argv[2] || '00000000-0000-0000-0000-000000000000';
  const out = await svc({ product_id: id });
  console.log(JSON.stringify(out, null, 2));
} catch (e) { console.error(e); process.exit(1); } })();
