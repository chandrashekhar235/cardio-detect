import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(__dirname, '../../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVerification() {
  console.log('--- Launching Chrome via puppeteer-core ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // Collect console errors & warnings
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    consoleMessages.push(`[UNCAUGHT ERROR] ${err.message}`);
  });

  // Always mark welcome screen as shown in this session
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('cardiodetect_welcome_shown', 'true');
  });

  console.log('\n=== CHECK 1: Verify Padding and Margin Resolution on Home Page ===');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Check computed styles on cards and buttons
  const styles = await page.evaluate(() => {
    const card = document.querySelector('.product-card, .product-card-glass');
    const heroBtn = document.querySelector('a[href="/assess"], button.btn-primary');
    const heading = document.querySelector('h1, h2');
    const statsSection = document.querySelector('section');

    return {
      card: card ? {
        className: card.className,
        paddingTop: window.getComputedStyle(card).paddingTop,
        paddingRight: window.getComputedStyle(card).paddingRight,
        paddingBottom: window.getComputedStyle(card).paddingBottom,
        paddingLeft: window.getComputedStyle(card).paddingLeft,
      } : null,
      button: heroBtn ? {
        className: heroBtn.className,
        paddingTop: window.getComputedStyle(heroBtn).paddingTop,
        paddingLeft: window.getComputedStyle(heroBtn).paddingLeft,
      } : null,
      heading: heading ? {
        className: heading.className,
        marginBottom: window.getComputedStyle(heading).marginBottom,
      } : null,
      section: statsSection ? {
        paddingTop: window.getComputedStyle(statsSection).paddingTop,
        paddingBottom: window.getComputedStyle(statsSection).paddingBottom,
      } : null
    };
  });

  console.log('Computed styles inspection:', JSON.stringify(styles, null, 2));

  console.log('\n=== CHECK 2: /report route behavior ===');
  // (a) With no completed assessment:
  await page.evaluate(() => {
    sessionStorage.removeItem('cardiodetect_latest_report');
    sessionStorage.removeItem('cardiodetect_session_cases');
  });
  await page.goto('http://localhost:5173/report', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const emptyState = await page.evaluate(() => {
    return {
      h1: document.querySelector('h1')?.innerText,
      hasAssessCTA: !!document.querySelector('a[href="/assess"]'),
      hasSampleBtn: Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Sample Case')),
      bodySnippet: document.body.innerText.slice(0, 200)
    };
  });
  console.log('Report empty state verification:', emptyState);
  await page.screenshot({ path: path.join(screenshotsDir, 'report_empty_state_1440_dark.png') });

  // (b) Click "Load a Sample Case"
  console.log('Clicking "Load a sample case"...');
  const clickedSample = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Load Sample Case') || b.textContent.includes('Sample Case'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Sample button clicked:', clickedSample);
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  const sampleReportLoaded = await page.evaluate(() => {
    return {
      h1: document.querySelector('h1')?.innerText,
      hasRiskBadge: document.body.innerText.includes('Risk') || document.body.innerText.includes('RISK'),
      hasNeighbors: document.body.innerText.includes('Nearest Neighbor Cohort Comparison') || document.body.innerText.includes('Deterministic K-Nearest'),
      hasWhatIf: document.body.innerText.includes('What-If Sensitivity Simulator') || document.body.innerText.includes('Modifiable Physiological Factors'),
      hasRecommendations: document.body.innerText.includes('Clinical Consensus') || document.body.innerText.includes('Protocol Directives')
    };
  });
  console.log('Sample report rendered verification:', sampleReportLoaded);
  await page.screenshot({ path: path.join(screenshotsDir, 'report_sample_case_1440_dark.png') });

  // (c) Test reload persistence via sessionStorage
  console.log('Reloading /report to test persistence in sessionStorage...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const persistsAfterReload = await page.evaluate(() => {
    return {
      h1: document.querySelector('h1')?.innerText,
      hasStoredItem: !!sessionStorage.getItem('cardiodetect_latest_report'),
      hasWhatIf: document.body.innerText.includes('What-If Sensitivity Simulator')
    };
  });
  console.log('Persistence check after page reload:', persistsAfterReload);

  // (d) Test older record missing nearest_neighbors
  console.log('Testing older record without nearest_neighbors...');
  await page.evaluate(() => {
    const oldRecord = {
      caseId: 'CASE-LEGACY-001',
      timestamp: new Date().toISOString(),
      prediction: 1,
      probability: 0.8,
      risk_percentage: 80,
      risk_label: 'Elevated Cardiovascular Risk',
      confidence_level: 'High',
      // nearest_neighbors omitted intentionally
      patient_summary: {
        age: 58,
        sex: 'Male',
        chest_pain: 'Asymptomatic',
        resting_bp: 145,
        cholesterol: 280,
        fasting_bs: 'True',
        resting_ecg: 'ST-T Wave Abnormality',
        max_hr: 130,
        exercise_angina: 'Yes',
        oldpeak: 2.2,
        st_slope: 'Flat'
      }
    };
    sessionStorage.setItem('cardiodetect_latest_report', JSON.stringify(oldRecord));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const legacyFallbackRender = await page.evaluate(() => {
    return {
      h1: document.querySelector('h1')?.innerText,
      fallbackFound: document.body.innerText.includes('Neighbor data unavailable for this older record')
    };
  });
  console.log('Legacy record fallback check:', legacyFallbackRender);

  console.log('\n=== CHECK 3: Full assessment flow ===');
  await page.goto('http://localhost:5173/assess', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Click on preset button
  const presetClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const preset = buttons.find(b => b.textContent.includes('High Risk Profile') || b.textContent.includes('Preset 1') || b.textContent.includes('Ischemic Risk'));
    if (preset) {
      preset.click();
      return preset.textContent.trim();
    }
    return false;
  });
  console.log('Clicked preset button in /assess:', presetClicked);
  await new Promise(r => setTimeout(r, 500));

  // Click "Generate Analysis" / Submit button
  const submitClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submit = buttons.find(b => b.textContent.includes('Run Clinical Assessment') || b.textContent.includes('Generate') || b.textContent.includes('Analyze'));
    if (submit) {
      submit.click();
      return submit.textContent.trim();
    }
    return false;
  });
  console.log('Clicked submit button:', submitClicked);
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  const assessmentNav = await page.evaluate(() => {
    return {
      url: window.location.pathname,
      h1: document.querySelector('h1')?.innerText,
      hasCaseId: document.body.innerText.includes('CD-') || document.body.innerText.includes('Case ID')
    };
  });
  console.log('Assessment submit navigation result:', assessmentNav);

  console.log('\n=== CHECK 4: Multi-viewport & Multi-theme Screenshot Capture ===');
  const routes = ['/', '/assess', '/report', '/insights', '/science', '/about'];
  const viewports = [
    { width: 390, height: 844, name: '390_mobile' },
    { width: 768, height: 1024, name: '768_tablet' },
    { width: 1440, height: 900, name: '1440_desktop' },
    { width: 1920, height: 1080, name: '1920_ultrawide' }
  ];

  for (const theme of ['dark', 'light']) {
    console.log(`Setting theme to: ${theme}`);
    await page.evaluate((th) => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(th);
      localStorage.setItem('cardiodetect_theme', th);
    }, theme);

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      for (const r of routes) {
        await page.goto(`http://localhost:5173${r}`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 400));
        const safeRouteName = r === '/' ? 'home' : r.replace('/', '');
        const filename = `${safeRouteName}_${vp.name}_${theme}.png`;
        await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: false });
      }
    }
  }

  console.log('\nCaptured console messages during entire session:');
  const filteredLogs = consoleMessages.filter(m => !m.includes('Download the React DevTools') && !m.includes('favicon'));
  console.log(filteredLogs.length ? filteredLogs : 'None! Completely clean console.');

  await browser.close();
  console.log('\nVerification script successfully completed!');
}

runVerification().catch(err => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
