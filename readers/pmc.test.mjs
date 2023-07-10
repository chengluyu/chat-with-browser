import pmc from "./pmc.mjs";
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
console.log('browser launched');
const page = await browser.newPage();
console.log('new page created');
await page.goto("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3289880/", {
  waitUntil: "networkidle0",
});
console.log('page loaded');
const context = {};
console.log('start reading');
let content = await pmc.read(page, context);
console.log(content);
while (await pmc.loadMore(page, context)) {
  content = await pmc.read(page, context);
  console.log(content);
}
await page.close();
await browser.close();
