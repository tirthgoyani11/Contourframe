import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { chromium } from 'playwright';

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/studio.html', ['studio.html', 'text/html']],
  ['/home.css', ['home.css', 'text/css']],
  ['/home.js', ['home.js', 'text/javascript']],
  ['/style.css', ['style.css', 'text/css']],
  ['/studio.js', ['studio.js', 'text/javascript']],
  ['/scene.js', ['scene.js', 'text/javascript']],
  ['/assets/contourframe.svg', ['assets/contourframe.svg', 'image/svg+xml']],
  ['/assets/alpine-crossing.mp4', ['assets/alpine-crossing.mp4', 'video/mp4']],
]);

const server = createServer(async (request, response) => {
  const asset = files.get(request.url);
  if (!asset) {
    response.writeHead(404).end();
    return;
  }
  const [file, type] = asset;
  const { size } = await stat(file);
  response.writeHead(200, { 'Content-Type': type, 'Content-Length': size });
  createReadStream(file).pipe(response);
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });
  const page = await browser.newPage({ viewport: { width: 390, height: 850 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  assert.match(await page.locator('h1').innerText(), /Put your story/);
  assert.equal(
    await page.getByRole('link', { name: 'Open local studio' }).first().getAttribute('href'),
    'http://localhost:8000/studio',
  );
  await page.getByRole('link', { name: 'Try the browser sample' }).click();
  await page.locator('video').evaluate(async video => {
    video.muted = true;
    await video.play();
  });
  await page.waitForFunction(() => document.querySelector('video').currentTime > 0);
  await page.locator('video').evaluate(video => video.pause());
  await page.locator('#title').fill('Alpine browser check');
  await page.locator('#duration').fill('2');
  await page.getByRole('button', { name: 'Save', exact: true }).press('Enter');
  await page.reload();
  assert.equal(await page.locator('#title').inputValue(), 'Alpine browser check');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

  await page.getByRole('button', { name: 'Export WebM' }).press('Enter');
  await page.getByRole('button', { name: 'Cancel export' }).click();
  await page.getByText('Export canceled.', { exact: true }).waitFor();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export WebM' }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'contourframe.webm');
  assert.equal(await download.failure(), null);
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const videoBytes = Buffer.concat(chunks);
  assert.equal(videoBytes.subarray(0, 4).toString('hex'), '1a45dfa3');
  await page.evaluate(async base64 => {
    const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
    const video = document.createElement('video');
    video.muted = true;
    video.src = url;
    document.body.append(video);
    await video.play();
  }, videoBytes.toString('base64'));
  await page.waitForFunction(() => [...document.querySelectorAll('video')].some(video =>
    video.src.startsWith('blob:') && video.currentTime > 0));
} finally {
  await browser?.close();
  server.close();
}
