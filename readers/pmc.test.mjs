import pmc from "./pmc.mjs";
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.goto("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2677731/", {
  waitUntil: "networkidle0",
});
const context = {};
let content = await pmc.read(page, context);
console.log(content);
while (await pmc.loadMore(page, context)) {
  content = await pmc.read(page, context);
  console.log(content);
}
await page.close();
await browser.close();
