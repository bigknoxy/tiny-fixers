const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3456/tiny-fixers/');
  await page.waitForTimeout(3000);
  
  // Dismiss tutorial if present
  try {
    const skipBtn = await page.$('text=Skip');
    if (skipBtn) await skipBtn.click();
    await page.waitForTimeout(500);
  } catch(e) {}
  
  try {
    const letsGo = await page.$('text=Let\'s Go');
    if (letsGo) await letsGo.click();
    await page.waitForTimeout(500);
  } catch(e) {}
  
  await page.screenshot({ path: '01_worlds.png' });
  
  // Check for world cards
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Sorting Station found:', pageText.includes('Sorting Station'));
  console.log('Tangle Town found:', pageText.includes('Tangle Town'));
  console.log('Packing Palace found:', pageText.includes('Packing Palace'));
  
  // Click Sorting Station
  try {
    await page.click('text=Sorting Station');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '02_levels.png' });
    
    // Check level numbers
    const levelText = await page.evaluate(() => document.body.innerText);
    console.log('Level 1 found:', levelText.includes('1'));
    console.log('Level 5 found:', levelText.includes('5'));
    console.log('Level 10 found:', levelText.includes('10'));
  } catch(e) {
    console.log('Could not click Sorting Station:', e.message);
  }
  
  await browser.close();
  console.log('Screenshots saved');
})();
