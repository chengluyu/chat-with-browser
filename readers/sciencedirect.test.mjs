import sd from "./sciencedirect.mjs";
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.goto(
  // "https://www.sciencedirect.com/science/article/pii/S0021925820398197",
  // "https://www.sciencedirect.com/science/article/pii/S1097276505013900",
  "https://www.sciencedirect.com/science/article/pii/S1097276511002875",
  { waitUntil: "networkidle0" }
);
const context = {};
let content = await sd.read(page, context);
console.log(content);
while (await sd.loadMore(page, context)) {
  content = await sd.read(page, context);
  console.log(content);
}
await page.close();
await browser.close();
