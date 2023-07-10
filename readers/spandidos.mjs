// import TurndownService from "turndown";
import sectionize from "../helpers/sectionize.mjs";
import toMarkdown from "../helpers/to-markdown.mjs";

// const turndownService = new TurndownService();
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
      const mainContentEl = document.querySelector(".content_article");
      if (mainContentEl === null) {
        return null;
      }
      const title = mainContentEl.querySelector("#titleId").textContent;
      const details = mainContentEl.querySelector(".article_details").innerText;
      const abstractEl = mainContentEl.querySelector("#articleAbstract");
      const abstract = abstractEl.textContent;
      const contentHTML = [];
      let node = abstractEl.nextElementSibling;
      while (node !== null) {
        contentHTML.push(node.outerHTML);
        node = node.nextElementSibling;
      }
      return {
        metadata: { title, details, abstract },
        contentHTML: contentHTML.join("\n"),
      };
    });
    const contentMarkdown = toMarkdown(contentHTML);
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
  name: "Spansisos Publications",
  urlPattern: /^https?:\/\/www.spandidos-publications.com\/.+/,
  read,
  loadMore,
};
