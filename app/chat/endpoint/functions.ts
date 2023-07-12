import puppeteer, { Browser, Page } from "puppeteer";
import { nanoid } from "nanoid";
import * as reader from "@/readers/index.mjs";
import { z } from "zod";

let browser: Browser | null = null;

type BrowserTab = {
  page: Page;
  context: Record<string, unknown>;
};

const tabMap = new Map<string, BrowserTab>();

const searchResponseBodySchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      snippet: z.string(),
      htmlSnippet: z.string(),
    })
  ),
});

export async function search({ query }: { query: string }) {
  const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;
  const GOOGLE_SEARCH_KEY = process.env.GOOGLE_SEARCH_KEY;
  if (typeof GOOGLE_SEARCH_CX !== "string") {
    throw new Error("Missing Environment Variable OPENAI_API_KEY");
  }
  if (typeof GOOGLE_SEARCH_KEY !== "string") {
    throw new Error("Missing Environment Variable OPENAI_API_KEY");
  }
  const params = new URLSearchParams({
    key: GOOGLE_SEARCH_KEY,
    cx: GOOGLE_SEARCH_CX,
    q: query,
  });
  const response = await fetch(
    "https://www.googleapis.com/customsearch/v1?" + params.toString()
  );
  const data = searchResponseBodySchema.parse(await response.json());
  return data.items.map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    htmlSnippet: item.htmlSnippet,
  }));
}

export async function navigate({ url }: { url: string }) {
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

export async function read({ tab: tabId }: { tab: string }) {
  const tab = tabMap.get(tabId);
  if (tab === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    const { page, context } = tab;
    return { ok: true, content: await reader.read(page, context) };
  }
}

export async function loadMore({ tab: tabId }: { tab: string }) {
  const tab = tabMap.get(tabId);
  if (tab === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    const { page, context } = tab;
    try {
      const hasMoreContent = await reader.loadMore(page, context);
      return { ok: true, hasMoreContent };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : String(e) };
    }
  }
}

export async function close({ tab: tabId }: { tab: string }) {
  const tab = tabMap.get(tabId);
  if (tab === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    await tab.page.close();
    tabMap.delete(tabId);
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
