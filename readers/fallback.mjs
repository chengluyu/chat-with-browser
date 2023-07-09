/**
 * Read content from any webpage. This is the fallback reader.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
async function read(page, context) {
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
  if (context.hasRead) {
    return { textContent: content };
  } else {
    context.hasRead = true;
    return {
      title: await page.evaluate(() => document.title),
      textContent: content,
    };
  }
}

/**
 * Scroll down the page to load more content.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<boolean>}
 */
async function loadMore(page, context) {
  const canScrollMore = await page.evaluate(() => {
    const beforeScrollY = window.scrollY;
    window.scrollBy(0, window.innerHeight);

    return new Promise((resolve) => {
      // Wait for the scroll to finish.
      setTimeout(() => {
        // Check if this is the last screen by comparing the scroll position with the total scrollable height.
        if (beforeScrollY + window.innerHeight >= document.body.scrollHeight) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 100); // Set a small timeout to allow the scroll to finish.
    });
  });
  return canScrollMore;
}

export default {
  name: "Fallback",
  urlPattern: /^https?:\/\/www.ncbi.nlm.nih.gov\/pmc\/articles\/PMC\d+/,
  read,
  loadMore,
};
