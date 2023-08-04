const puppet = require('puppeteer');
require("dotenv").config();

async function scrape()
{
    const browser = await puppet.launch({headless: false});
    let page = await browser.newPage();
    await page.goto('https://bemidjistate.learn.minnstate.edu/d2l/lms/news/main.d2l?ou=4779556', {waitUntil: 'networkidle0'});
    let nextPageButton = await page.$('div[class="d2l-page-main d2l-max-width"] > div[class="d2l-page-main-padding"] > div > d2l-html-block >>> div[class=" d2l-html-block-rendered "] > p[style="text-align: center;"] > a');
    await nextPageButton.click();
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    let username = await page.$('#username');
    await username.type(process.env.STAR_ID);
    let password = await page.$('#password');
    await password.type(process.env.D2L_PASS);
    let login = await page.$('div[class="form-element-wrapper"] > button');
    await login.click();
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    await page.reload();
    let announcmentHeader = await page.$$eval("#d2l_2_5_86 > ul > li:nth-child(1) > div.d2l-datalist-item-content > h3 > a", el => el.textContent);
    console.log(announcmentHeader);
}

(async () =>{
    await scrape();
})
();