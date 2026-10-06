const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\NITRO 5\\.gemini\\antigravity\\brain\\793995e7-992f-4bb6-92c8-e5b70213b3f0';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log('Logging in as admin...');
        await page.goto('http://localhost:8080/admin/dang-nhap', { waitUntil: 'networkidle2' });

        await page.type('#email', 'admin');
        await page.type('#password', '123456');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('#submitBtn')
        ]);

        console.log('Navigating to orders list...');
        await page.goto('http://localhost:8080/admin/don-hang', { waitUntil: 'networkidle2' });

        await page.waitForSelector('.admin-btn-icon[onclick*="openOrderDetailModal"]', { timeout: 10000 });

        const orderIds = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('.admin-btn-icon[onclick*="openOrderDetailModal"]'));
            return btns.map(b => b.getAttribute('data-id'));
        });

        console.log('Order IDs found:', orderIds);

        const id0 = orderIds[0] || '356';
        const id1 = orderIds[1] || '324';
        const id2 = orderIds[2] || '168';

        // 1. Loading State Screenshot
        await page.evaluate((id) => window.openOrderDetailModal(id), id0);
        await page.screenshot({ path: path.join(artifactDir, 'modal_loading.png') });
        console.log('Saved modal_loading.png');
        await new Promise(r => setTimeout(r, 2000));

        // 2. Desktop SePay / Regular order
        await page.screenshot({ path: path.join(artifactDir, 'modal_sepay_desktop.png') });
        console.log('Saved modal_sepay_desktop.png');

        // 3. Desktop Return / Refund order
        await page.evaluate((id) => window.openOrderDetailModal(id), id1);
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(artifactDir, 'modal_return_desktop.png') });
        console.log('Saved modal_return_desktop.png');

        // 4. Desktop Refunded / POS order
        await page.evaluate((id) => window.openOrderDetailModal(id), id2);
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(artifactDir, 'modal_refunded_desktop.png') });
        console.log('Saved modal_refunded_desktop.png');

        // POS Order screenshot
        const posId = orderIds.find(id => id === '99' || id === '101') || '99';
        await page.evaluate((id) => window.openOrderDetailModal(id), posId);
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(artifactDir, 'modal_pos_desktop.png') });
        console.log('Saved modal_pos_desktop.png');

        // 5. Tablet View (768x1024)
        await page.setViewport({ width: 768, height: 1024 });
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: path.join(artifactDir, 'modal_tablet.png') });
        console.log('Saved modal_tablet.png');

        // 6. Mobile View (390x844)
        await page.setViewport({ width: 390, height: 844 });
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: path.join(artifactDir, 'modal_mobile.png') });
        console.log('Saved modal_mobile.png');

        // 7. Error State (Non-existent order ID 999999)
        await page.setViewport({ width: 1440, height: 900 });
        await page.evaluate(() => window.openOrderDetailModal(999999));
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(artifactDir, 'modal_error.png') });
        console.log('Saved modal_error.png');

        console.log('All screenshots captured successfully!');
    } catch (err) {
        console.error('Automation error:', err);
    } finally {
        await browser.close();
    }
})();
