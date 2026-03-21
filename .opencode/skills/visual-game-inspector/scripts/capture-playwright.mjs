#!/usr/bin/env node

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, label: 'iPhone 14' },
  { name: '360x640', width: 360, height: 640, label: 'Small Mobile' },
  { name: '768x1024', width: 768, height: 1024, label: 'Tablet' },
  { name: '1440x900', width: 1440, height: 900, label: 'Desktop' },
];

async function captureGame(url, outputDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseDir = outputDir || join(process.cwd(), 'artifacts', 'visual-inspection', timestamp);
  
  mkdirSync(baseDir, { recursive: true });
  
  const results = {
    url,
    timestamp: new Date().toISOString(),
    viewports: [],
    consoleLogs: [],
    pageErrors: [],
    failedRequests: [],
    screenshots: [],
  };

  console.log(`Capturing: ${url}`);
  console.log(`Output: ${baseDir}\n`);

  for (const viewport of VIEWPORTS) {
    console.log(`Capturing ${viewport.name} (${viewport.label})...`);
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
    });
    
    const page = await context.newPage();
    
    const viewportLogs = [];
    const viewportErrors = [];
    const viewportFailures = [];
    
    page.on('console', msg => {
      const entry = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      };
      viewportLogs.push(entry);
      results.consoleLogs.push({ ...entry, viewport: viewport.name });
    });
    
    page.on('pageerror', error => {
      const entry = {
        message: error.message,
        stack: error.stack,
      };
      viewportErrors.push(entry);
      results.pageErrors.push({ ...entry, viewport: viewport.name });
    });
    
    page.on('requestfailed', request => {
      const entry = {
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
      };
      viewportFailures.push(entry);
      results.failedRequests.push({ ...entry, viewport: viewport.name });
    });
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      
      await page.waitForTimeout(2000);
      
      const screenshotPath = join(baseDir, `${viewport.name.replace('x', '-')}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false,
        animations: 'disabled',
      });
      
      results.screenshots.push({
        viewport: viewport.name,
        label: viewport.label,
        path: screenshotPath,
        width: viewport.width,
        height: viewport.height,
      });
      
      results.viewports.push({
        name: viewport.name,
        label: viewport.label,
        width: viewport.width,
        height: viewport.height,
        status: response?.status() || 'unknown',
        logs: viewportLogs.length,
        errors: viewportErrors.length,
        failures: viewportFailures.length,
      });
      
      console.log(`  Status: ${response?.status() || 'unknown'}`);
      console.log(`  Console: ${viewportLogs.length} messages`);
      console.log(`  Errors: ${viewportErrors.length}`);
      console.log(`  Failed requests: ${viewportFailures.length}`);
      console.log(`  Screenshot: ${screenshotPath}\n`);
      
    } catch (error) {
      console.error(`  Error: ${error.message}\n`);
      results.viewports.push({
        name: viewport.name,
        label: viewport.label,
        error: error.message,
      });
    }
    
    await browser.close();
  }
  
  const summaryPath = join(baseDir, 'summary.json');
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  console.log(`Summary: ${summaryPath}`);
  
  if (results.consoleLogs.length > 0) {
    const consolePath = join(baseDir, 'console.log');
    const consoleContent = results.consoleLogs
      .map(log => `[${log.viewport}] [${log.type.toUpperCase()}] ${log.text}`)
      .join('\n');
    writeFileSync(consolePath, consoleContent);
    console.log(`Console logs: ${consolePath}`);
  }
  
  if (results.pageErrors.length > 0) {
    const errorsPath = join(baseDir, 'errors.log');
    const errorsContent = results.pageErrors
      .map(err => `[${err.viewport}] ${err.message}\n${err.stack || ''}`)
      .join('\n\n');
    writeFileSync(errorsPath, errorsContent);
    console.log(`Page errors: ${errorsPath}`);
  }
  
  if (results.failedRequests.length > 0) {
    const failuresPath = join(baseDir, 'network-failures.log');
    const failuresContent = results.failedRequests
      .map(f => `[${f.viewport}] ${f.method} ${f.url} - ${f.failure}`)
      .join('\n');
    writeFileSync(failuresPath, failuresContent);
    console.log(`Failed requests: ${failuresPath}`);
  }
  
  console.log('\n--- Capture Complete ---');
  console.log(`Total screenshots: ${results.screenshots.length}`);
  console.log(`Total console messages: ${results.consoleLogs.length}`);
  console.log(`Total page errors: ${results.pageErrors.length}`);
  console.log(`Total failed requests: ${results.failedRequests.length}`);
  
  return { baseDir, results };
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: capture-playwright.mjs <URL> [output-directory]');
  console.error('');
  console.error('Arguments:');
  console.error('  URL                Game URL to capture');
  console.error('  output-directory   Optional output directory (default: artifacts/visual-inspection/<timestamp>)');
  console.error('');
  console.error('Examples:');
  console.error('  capture-playwright.mjs https://example.com/game');
  console.error('  capture-playwright.mjs https://example.com/game ./my-captures');
  process.exit(1);
}

const url = args[0];
const outputDir = args[1];

if (!url.startsWith('http://') && !url.startsWith('https://')) {
  console.error('Error: URL must start with http:// or https://');
  process.exit(1);
}

captureGame(url, outputDir).catch(error => {
  console.error('Capture failed:', error.message);
  process.exit(1);
});
