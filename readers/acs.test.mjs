import acs from "./acs.mjs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.goto("https://pubs.acs.org/doi/10.1021/cr500373h", {
  waitUntil: "networkidle0",
});
const context = {};
let content = await acs.read(page, context);
console.log(content);
while (await acs.loadMore(page, context)) {
  content = await acs.read(page, context);
  console.log(content);
}
await page.close();
await browser.close();
