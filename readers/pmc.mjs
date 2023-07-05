/**
 * Read content from PubMed Central.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
async function read(page, context) {
  // First time? Get metadata.
  if (!("completed" in context)) {
    const metadata = await page.evaluate(() => {
      const mainContentEl = document.querySelector("#mc");
      if (mainContentEl === null) {
        return null;
      }
      const source = mainContentEl.querySelector(".fm-citation").textContent;
      const identifiers = mainContentEl.querySelector(".fm-ids").textContent;
      const title = mainContentEl.querySelector(".content-title").textContent;
      const authors = mainContentEl.querySelector(".fm-author").textContent;
      let abstract = "";
      for (const node of mainContentEl.querySelectorAll("#abstract-1 p")) {
        abstract += node.textContent.trim() + "\n";
      }
      return {
        source,
        identifiers,
        title,
        authors,
        abstract,
      };
    });
    context.metadata = metadata;
    context.lastVisitedTag = "#abstract-1";
    context.completed = false;
    // console.log('Updated context', context)
    return metadata;
  } else {
    const { content, ...patch } = await page.evaluate((lastVisitedTag) => {
      const mainContentEl = document.querySelector("#mc");
      if (mainContentEl === null) {
        return false;
      }
      let node = mainContentEl.querySelector(lastVisitedTag).nextElementSibling;
      while (node !== null && node.id.length === 0) {
        node = node.nextElementSibling;
      }
      if (node === null || node.id.length === 0) {
        return { completed: true, content: null };
      } else {
        return { lastVisitedTag: "#" + node.id, content: node.textContent };
      }
    }, context.lastVisitedTag);
    Object.assign(context, patch);
    // console.log('Updated context', context)
    return content;
  }
}

/**
 * Load more content from PubMed Central.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<boolean>}
 */
async function loadMore(page, context) {
  if (typeof context.lastVisitedTag !== "string") {
    throw new Error("please call the read function first");
  }
  if (context.completed) {
    return false;
  }
  return await page.evaluate((lastVisitedTag) => {
    const mainContentEl = document.querySelector("#mc");
    if (mainContentEl === null) {
      return false;
    }
    const node = mainContentEl.querySelector(lastVisitedTag);
    return node.nextElementSibling !== null;
  }, context.lastVisitedTag);
}

export default {
  name: "PubMed Central",
  urlPattern: /^https?:\/\/www.ncbi.nlm.nih.gov\/pmc\/articles\/PMC\d+/,
  read,
  loadMore,
};
