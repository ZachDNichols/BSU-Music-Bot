const puppet = require('puppeteer');
require('dotenv').config();

async function scrape() {
	const browser = await puppet.launch({ headless: false });
	let page = await browser.newPage();
	await page.goto('https://bemidjistate.learn.minnstate.edu/d2l/lms/news/main.d2l?ou=4779556', { waitUntil: 'networkidle0' });
	const nextPageButton = await page.$('div[class="d2l-page-main d2l-max-width"] > div[class="d2l-page-main-padding"] > div > d2l-html-block >>> div[class=" d2l-html-block-rendered "] > p[style="text-align: center;"] > a');
	await nextPageButton.click();
	await page.waitForNavigation({ waitUntil: 'networkidle0' });
	const username = await page.$('#username');
	await username.type(process.env.STAR_ID);
	const password = await page.$('#password');
	await password.type(process.env.D2L_PASS);
	const login = await page.$('div[class="form-element-wrapper"] > button');
	await login.click();
	await page.waitForNavigation({ waitUntil: 'networkidle0' });
	await page.waitForNavigation({ waitUntil: 'networkidle0' });
	await page
		.waitForSelector('div[class="d2l-page-main d2l-max-width d2l-min-width"] > div[class="d2l-page-main-padding"] > div[class="d2l-homepage"] > div[class="homepage-container"] > div[class="homepage-row"] > div' +
			' > div[class="homepage-col-8"] > div[class="d2l-widget d2l-tile"] > d2l-expand-collapse-content > div[class="d2l-widget-content-padding"] > div[class="d2l-placeholder d2l-placeholder-live"] > ' +
			'div > div[class="d2l-datalist-container d2l-datalist-style1 d2l-datalist-block d2l-datalist-outdent"] > ul > li')
		.then(() => console.log('got it'));
	browser.close();
	//	const annoucnemnetHeaderText = await (await announcmentHeader.getProperty('textContent')).jsonValue();
}

(async () => {
	await scrape();
})
();