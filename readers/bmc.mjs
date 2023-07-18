// import TurndownService from "turndown";
import sectionize from "../helpers/sectionize.mjs";
import removeCitations from "../helpers/rm-cite.mjs";
import toMarkdown from "../helpers/to-markdown.mjs";

// const turndownService = new TurndownService();

/**
 * Read content from PubMed Central.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
async function read(page, context) {
  // First time? Get metadata.
  if (!("metadata" in context)) {
    const { metadata, abstractHTML, contentHTML } = await page.evaluate(() => {
      const mainContentEl = document.querySelector("article");
      if (mainContentEl === null) {
        return null;
      }
      const headerEl = mainContentEl.querySelector(".c-article-header");
      const source = mainContentEl
        .querySelector(".c-article-info-details")
        .textContent.trim();
      const identifiers = headerEl.querySelector(
        ".c-article-identifiers"
      ).innerText;
      const title = mainContentEl.querySelector(".c-article-title").textContent;
      const authors = mainContentEl.querySelector(
        ".c-article-author-list"
      ).textContent;

      const sections = Array.from(
        mainContentEl.querySelectorAll("section[data-title]")
      );
      const abstract = sections.filter((el) => el.dataset.title === "Abstract");
      const mainSections = sections.filter(
        (el) => el.dataset.title !== "Abstract"
      );
      const abstractHTML = abstract
        .map((el) => extractSection(el, 2))
        .map((s) => s.contentHTML)
        .join("\n");
      const contentHTML = mainSections
        .map((el) => extractSection(el, 2))
        .map((s) => s.headingHTML + "\n" + s.contentHTML)
        .join("\n");
      return {
        metadata: {
          source,
          identifiers,
          title,
          authors,
        },
        abstractHTML,
        contentHTML,
      };

      function extractSection(el) {
        return {
          headingHTML: el.querySelector("h2.c-article-section__title")
            .outerHTML,
          contentHTML: el.querySelector(".c-article-section__content")
            .innerHTML,
        };
      }
    });
    const contentMarkdown = await toMarkdown(contentHTML);
    metadata.abstract = await toMarkdown(abstractHTML);
    context.metadata = metadata;
    context.sections = sectionize(
      contentMarkdown,
      removeCitations.bind(null, [[/^(?:\d+)$/, /^(?:#ref-CR\d+)$/]])
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
  name: "BioMed Central",
  // https://clinicalepigeneticsjournal.biomedcentral.com/articles/10.1186/s13148-016-0223-4
  urlPattern: /^https?:\/\/\w+\.biomedcentral\.com\/articles\/[\w\d/]+/,
  read,
  loadMore,
};
