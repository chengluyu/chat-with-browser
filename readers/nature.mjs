import TurndownService from "turndown";
import sectionize from "../helpers/sectionize.mjs";

const turndownService = new TurndownService();
// const markdown = turndownService.turndown("<h1>Hello world!</h1>");

/**
 * Read content from PubMed Central.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
async function read(page, context) {
  // First time? Get metadata.
  if (!("metadata" in context)) {
    const { metadata, contentHTML } = await page.evaluate(() => {
      const articleHeaderEl = document.querySelector(
        ".c-article-header > header"
      );
      const articleBodyEl = document.querySelector(".c-article-body");
      if (articleHeaderEl === null || articleBodyEl === null) {
        return null;
      }
      const title =
        articleHeaderEl.querySelector(".c-article-title").textContent;
      const authors = articleHeaderEl.querySelector(
        ".c-article-author-list"
      ).innerText;
      const abstract = articleBodyEl.querySelector(
        "section[data-title='Abstract']"
      ).innerText;
      return {
        metadata: { title, authors, abstract },
        contentHTML: articleBodyEl.querySelector(".main-content").innerHTML,
      };
    });
    const contentMarkdown = turndownService.turndown(contentHTML);
    context.metadata = metadata;
    context.sections = sectionize(contentMarkdown);
    context.nextSectionIndex = 0;
    return metadata;
  } else {
    const { sections, nextSectionIndex } = context;
    if (nextSectionIndex < sections.length) {
      const section = sections[nextSectionIndex];
      context.nextSectionIndex++;
      console.log(`Send the following secton: ${section.slice(0, 200)}`);
      return section;
    } else {
      return null;
    }
  }
}

/**
 * Load more content from PubMed Central.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<boolean>}
 */
async function loadMore(page, context) {
  if (Array.isArray(context.sections)) {
    return context.nextSectionIndex < context.sections.length;
  } else {
    return false;
  }
}

export default {
  name: "Nature",
  urlPattern: /^https?:\/\/www.nature.com\/articles\/.+/,
  read,
  loadMore,
};
