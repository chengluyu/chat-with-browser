import pmc from "./pmc.mjs";
import fallback from "./fallback.mjs";

const readers = [pmc, fallback];

/**
 * Try to find a reader for the given web page.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
export function read(page, context) {
  for (const { name, urlPattern, read } of readers) {
    if (urlPattern.test(page.url())) {
      console.log(`Read with reader "${name}"`)
      return read(page, context);
    }
  }
  return null;
}

/**
 * Read more content from the given web page.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<boolean>}
 */
export function loadMore(page, context) {
  for (const { name, urlPattern, loadMore } of readers) {
    if (urlPattern.test(page.url())) {
      console.log(`Load more with reader "${name}"`)
      return loadMore(page, context);
    }
  }
  return null;
}
