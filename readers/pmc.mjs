import TurndownService from "turndown";
import sectionize from "../helpers/sectionize.mjs";
import removeCitations from "../helpers/rm-cite.mjs";

const turndownService = new TurndownService();

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
      const abstractEl = mainContentEl.querySelector("#abstract-1");
      let contentHTML = "";
      let node = abstractEl.nextElementSibling;
      while (node !== null && node.id.length > 0) {
        contentHTML += node.outerHTML;
        node = node.nextElementSibling;
      }
      return {
        metadata: {
          source,
          identifiers,
          title,
          authors,
          abstract,
        },
        contentHTML,
      };
    });
    const contentMarkdown = turndownService.turndown(contentHTML);
    context.metadata = metadata;
    context.sections = sectionize(
      contentMarkdown,
      removeCitations.bind(
        null,
        /^(?:\w+?, \d\d\d\d|Fig. \d+\w+)$/,
        /^(?:#R\d+|\/pmc\/articles\/PMC\d+\/figure\/\w+\/)$/
      )
    );
    context.nextSectionIndex = 0;
    return metadata;
  } else {
    const { sections, nextSectionIndex } = context;
    if (nextSectionIndex < sections.length) {
      const section = sections[nextSectionIndex];
      context.nextSectionIndex++;
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
  name: "PubMed Central",
  urlPattern: /^https?:\/\/www.ncbi.nlm.nih.gov\/pmc\/articles\/PMC\d+/,
  read,
  loadMore,
};
