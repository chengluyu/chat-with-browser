import sd from "./sciencedirect.mjs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.goto(
  // "https://www.sciencedirect.com/science/article/pii/S0021925820398197",
  // "https://www.sciencedirect.com/science/article/pii/S1097276505013900",
  // "https://www.sciencedirect.com/science/article/pii/S1097276511002875",
  // "https://www.sciencedirect.com/science/article/pii/S0959440X16301956",
  // "https://www.sciencedirect.com/science/article/pii/S0076687910810055",
  "https://www.sciencedirect.com/science/article/pii/S0022283602003868",
  { waitUntil: "networkidle0" }
);
// await new Promise((resolve) => setTimeout(resolve, 3000));
const context = {};
let content = await sd.read(page, context);
console.log(content);
while (await sd.loadMore(page, context)) {
  content = await sd.read(page, context);
  console.log(content);
}
await page.close();
await browser.close();
