import nature from "./nature.mjs";
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
// await page.goto("https://www.nature.com/articles/s41586-021-03491-6");
await page.goto("https://www.nature.com/articles/s41586-019-1835-6");
const context = {};
let content = await nature.read(page, context);
console.log(content);
while (await nature.loadMore(page, context)) {
  content = await nature.read(page, context);
  console.log(content);
}
await page.close();
await browser.close();
