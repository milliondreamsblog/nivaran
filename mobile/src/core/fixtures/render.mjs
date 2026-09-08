// Rebuild the two authored document fixtures; no provider or network calls.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const output = new URL('../../../assets/fixtures/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }) });
const manifest = {};
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 1120 }, deviceScaleFactor: 1 });
  for (const name of ['relieving-letter', 'claim-rejection']) {
    await page.setContent(await readFile(new URL(`${name}.html`, import.meta.url), 'utf8'));
    await page.evaluate(() => document.fonts.ready);
    const bytes = await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true });
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const relieving = name === 'relieving-letter';
    manifest[sha256] = {
      file: `${name}.png`, mime: 'image/png',
      extraction: {
        doc_type: relieving ? 'relieving_letter' : 'claim_rejection', employer: 'Meridian Textiles Pvt Ltd',
        dates: [{ label: 'date of exit', value_iso: relieving ? '2025-03-31' : '2025-04-15', text: relieving ? '31 March 2025' : '15 April 2025' }],
        claim_status: relieving ? null : 'rejected', rejection_reason: relieving ? null : 'Date of exit mismatch', confidence: 1,
      },
    };
  }
} finally { await browser.close(); }
await writeFile(new URL('extractions.json', import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ rendered: Object.values(manifest).map(item => item.file), manifest: 'extractions.json' }));
