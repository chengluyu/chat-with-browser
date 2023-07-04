import puppeteer from "puppeteer";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

/** @type {import("puppeteer").Browser | null} */
let browser = null;

/** @type {Map<string, import("puppeteer").Page>} */
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
  page.setViewport({ width: 1440, height: 900 })
  await page.goto(url);
  const id = nanoid();
  tabMap.set(id, page);
  return { ok: true, tab: id };
}

export async function read({ tab }) {
  const page = tabMap.get(tab);
  if (page === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    const content = await page.evaluate(() => {
      function isVisibleInViewport(el) {
        const rect = el.getBoundingClientRect();
        const unwantedTags = [
          "SCRIPT",
          "STYLE",
          "NOSCRIPT",
          "TEMPLATE",
          "META",
          "LINK",
        ];

        if (unwantedTags.includes(el.tagName)) {
          return false;
        }

        return (
          rect.top <
            (window.innerHeight || document.documentElement.clientHeight) &&
          rect.left <
            (window.innerWidth || document.documentElement.clientWidth) &&
          rect.bottom > 0 &&
          rect.right > 0
        );
      }

      function getVisibleText(node) {
        let text = "";
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent;
        } else if (
          node.nodeType === Node.ELEMENT_NODE &&
          isVisibleInViewport(node)
        ) {
          for (let i = 0; i < node.childNodes.length; i++) {
            const childText = getVisibleText(node.childNodes[i]);
            if (childText) {
              // Add a space to separate text from different child nodes.
              text += " " + childText;
            }
          }
        }
        // Trim leading and trailing spaces, and replace multiple spaces with a single space.
        return text.replace(/\s+/g, " ").trim();
      }

      return getVisibleText(document.body);
    });
    return { ok: true, content };
  }
}

export async function scrollDown({ tab }) {
  const page = tabMap.get(tab);
  if (page === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    const canScrollMore = await page.evaluate(() => {
      const beforeScrollY = window.scrollY;
      window.scrollBy(0, window.innerHeight);

      return new Promise((resolve) => {
        // Wait for the scroll to finish.
        setTimeout(() => {
          // Check if this is the last screen by comparing the scroll position with the total scrollable height.
          if (
            beforeScrollY + window.innerHeight >=
            document.body.scrollHeight
          ) {
            resolve(true);
          } else {
            resolve(false);
          }
        }, 100); // Set a small timeout to allow the scroll to finish.
      });
    });
    return { ok: true, canScrollMore };
  }
}

export async function close({ tab }) {
  const page = tabMap.get(tab);
  if (page === undefined) {
    return { ok: false, message: "Tab not found." };
  } else {
    await page.close();
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
