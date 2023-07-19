import acs from "./acs.mjs";
import bmc from "./bmc.mjs";
import pmc from "./pmc.mjs";
import fallback from "./fallback.mjs";
import spandidos from "./spandidos.mjs";
import scienceDirect from "./sciencedirect.mjs";
import nature from "./nature.mjs";
import springerLinkChapters from "./springer/chapter.mjs";

const readers = [
  acs,
  bmc,
  pmc,
  spandidos,
  scienceDirect,
  nature,
  springerLinkChapters,
  fallback,
];

/**
 * Try to find a reader for the given web page.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
export function read(page, context) {
  for (const { name, urlPattern, read } of readers) {
    if (urlPattern.test(page.url())) {
      console.log(`Read with reader "${name}"`);
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
      console.log(`Load more with reader "${name}"`);
      return loadMore(page, context);
    }
  }
  return null;
}
