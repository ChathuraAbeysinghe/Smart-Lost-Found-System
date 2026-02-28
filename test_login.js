const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Register a new user first to ensure we can login
    console.log('Navigating to register...');
    await page.goto('http://localhost:3000/register');

    const testId = `IT${Math.floor(Math.random() * 10000000)}`;
    console.log(`Registering with ID: ${testId}`);
    await page.fill('input[placeholder="John Doe"]', 'Test User');
    await page.fill('input[placeholder="IT23844292"]', testId);
    await page.fill('input[placeholder="you@uni.edu"]', `${testId}@my.sliit.lk`);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to happen (should go to /login)
    await page.waitForTimeout(3000);

    console.log('Logging in...');
    await page.fill('input[placeholder="e.g. IT23844292 or admin"]', testId);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to home
    await page.waitForTimeout(3000);
    console.log('Current URL after login:', page.url());

    // Now navigate to user dashboard
    console.log('Navigating to user dashboard...');
    await page.goto('http://localhost:3000/user-dashboard');

    await page.waitForTimeout(3000); // let data load

    console.log('Taking screenshot...');
    // Force screen size to a large desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: 'dashboard_screenshot.png', fullPage: true });

    console.log('Done.');
    await browser.close();
})();
