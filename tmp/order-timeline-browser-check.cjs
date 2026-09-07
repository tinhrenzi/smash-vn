const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('../scratch/node_modules/puppeteer');

(async () => {
  const previewDir = path.join(__dirname, 'order-status-alignment-review');
  const files = fs.readdirSync(previewDir).filter(name => name.endsWith('.html'));
  if (!files.length) throw new Error('Rendered previews are required');
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    let checked = 0;
    for (const width of [1024, 768, 390, 320]) {
      await page.setViewport({ width, height: 500, deviceScaleFactor: 1 });
      for (const file of files) {
        await page.goto(pathToFileURL(path.join(previewDir, file)).href, { waitUntil: 'load' });
        const report = await page.evaluate(() => {
          const failures = [];
          for (const timeline of document.querySelectorAll('.timeline-stepper')) {
            const steps = [...timeline.querySelectorAll('.timeline-stepper-step')];
            steps.forEach((step, index) => {
              const circle = step.querySelector('.timeline-stepper-icon-circle').getBoundingClientRect();
              if (!index) return;
              const previous = steps[index - 1].querySelector('.timeline-stepper-icon-circle').getBoundingClientRect();
              const line = getComputedStyle(step, '::before');
              const bounds = step.getBoundingClientRect();
              const x1 = bounds.x + parseFloat(line.left);
              const x2 = x1 + parseFloat(line.width);
              const y = bounds.y + parseFloat(line.top) + parseFloat(line.height) / 2;
              const near = (a, b) => Math.abs(a - b) < 0.1;
              if (!near(x1, previous.x + previous.width / 2) || !near(x2, circle.x + circle.width / 2)) failures.push(`step ${index}: horizontal endpoints`);
              if (!near(y, previous.y + previous.height / 2) || !near(y, circle.y + circle.height / 2)) failures.push(`step ${index}: vertical center`);
              if (previous.right > circle.left) failures.push(`step ${index}: circles overlap`);
              const complete = steps[index - 1].classList.contains('finish') && step.classList.contains('finish');
              const expected = complete ? (getComputedStyle(step).getPropertyValue('--step-color').trim() ? 'rgb(229, 57, 53)' : 'rgb(46, 193, 85)') : 'rgb(224, 224, 224)';
              if (line.backgroundColor !== expected) failures.push(`step ${index}: connector color ${line.backgroundColor}`);
            });
          }
          return failures;
        });
        if (report.length) throw new Error(`${file} at ${width}px: ${report.join('; ')}`);
        checked++;
        if (file.includes('da_giao') && width === 1024) {
          await page.screenshot({ path: path.join(previewDir, 'delivered-desktop.png'), fullPage: true });
        }
        if (file.includes('da_giao') && width === 390) {
          await page.screenshot({ path: path.join(previewDir, 'delivered-mobile.png'), fullPage: true });
        }
      }
    }
    console.log(JSON.stringify({ renderedStates: files.length, viewportWidths: [1024, 768, 390, 320], checksPassed: checked, alignmentTolerancePx: 0.1 }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
