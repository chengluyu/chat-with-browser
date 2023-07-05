import puppeteer from "puppeteer";
import { nanoid } from "nanoid";
import * as reader from "./readers/index.mjs";
import dotenv from "dotenv";

dotenv.config();

/** @type {import("puppeteer").Browser | null} */
let browser = null;

/** @type {Map<string, { page: import("puppeteer").Page, context: Record<string, unknown> }>} */
const tabMap = new Map();

export async function search({ query }) {
  const params = new URLSearchParams({
    key: process.env.GOOGLE_SEARCH_KEY,
    cx: process.env.GOOGLE_SEARCH_CX,
    q: query,
  });
  const response = await fetch(
    "https://www.googleapis.com/customsearch/v1?" + params.toString()
  );
  const data = await response.json();
  return data.items.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    htmlSnippet: item.htmlSnippet,
  }));
}

export async function navigate({ url }) {
  if (browser === null) {
    browser = await puppeteer.launch({ headless: "new" });
  }
  const page = await browser.newPage();
  page.setViewport({ width: 1440, height: 900 });
  await page.goto(url);
  const id = nanoid();
  tabMap.set(id, { page, context: {} });
  return { ok: true, tab: id };
}

/**
 * @param {{ tab: string }} args
 */
export async function read({ tab: tabId }) {
  const tab = tabMap.get(tabId);
  if (tab === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    const { page, context } = tab;
    return { ok: true, content: await reader.read(page, context) };
  }
}

/**
 * @param {{ tab: string }} args
 */
export async function loadMore({ tab: tabId }) {
  const tab = tabMap.get(tabId);
  if (tab === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    const { page, context } = tab;
    try {
      const hasMoreContent = await reader.loadMore(page, context);
      return { ok: true, hasMoreContent };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  }
}

/**
 * @param {{ tab: string }} args
 */
export async function close({ tab: tabId }) {
  const tab = tabMap.get(tabId);
  if (tab === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    await tab.page.close();
    tabMap.delete(tab);
    return { ok: true, message: "Tab closed." };
  }
}

export default [
  {
    name: "search",
    description: "Search Google for the given query.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query to search for.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "navigate",
    description: [
      "Navigate to the given URL.",
      "The function returns a browser tab ID if successful.",
      "Otherwise, it will returns an error message.",
      "Remember to close the tab after use.",
    ].join(" "),
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to navigate to.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "read",
    description: [
      "Read the given webpage.",
      "The function returns the visible text content of the webpage.",
      "Otherwise, it will returns an error message.",
      "You can use scrollDown() to scroll down the webpage.",
      "Remember to close the tab after use.",
    ].join(" "),
    parameters: {
      type: "object",
      properties: {
        tab: {
          type: "string",
          description: "The tab ID to read.",
        },
      },
      required: ["tab"],
    },
  },
  {
    name: "scrollDown",
    description: [
      "Scroll down the given webpage.",
      "The function returns a boolean indicating whether there is more content to scroll.",
      "Otherwise, it will returns an error message.",
      "Remember to close the tab after use.",
    ].join(" "),
    parameters: {
      type: "object",
      properties: {
        tab: {
          type: "string",
          description: "The tab ID to scroll.",
        },
      },
    },
  },
  {
    name: "close",
    description: [
      "Close the given browser tab.",
      "The function returns a success message if successful.",
      "Otherwise, it will returns an error message.",
      "Remember to close the tab after use.",
    ].join(" "),
    parameters: {
      type: "object",
      properties: {
        tab: {
          type: "string",
          description: "The tab ID to close.",
        },
      },
      required: ["tab"],
    },
  },
];
