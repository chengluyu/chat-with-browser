// import TurndownService from "turndown";
import removeCitations from "@/helpers/rm-cite.mjs";
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
      const articleInfoEl = document.body.querySelector(
        "#article-info-content"
      );
      let identifiers = null;
      if (articleInfoEl !== null) {
        articleInfoEl.querySelector('abbr[title="Digital Object Identifier"]');
        const identifierEl = articleInfoEl.parentElement.querySelector(
          ".c-bibliographic-information__value"
        );
        identifiers = identifierEl.innerText;
      }
      return {
        metadata: { identifiers, title, authors, abstract },
        contentHTML: articleBodyEl.querySelector(".main-content").innerHTML,
      };
    });
    const contentMarkdown = await toMarkdown(contentHTML);
    context.metadata = metadata;
    context.sections = sectionize(
      contentMarkdown,
      removeCitations.bind(
        null,
        /^(?:\d+|\d+[a-z](?:-[a-z]|, [a-z])*)$/,
        /#(?:ref-CR\d+|Fig\d+|MOESM\d+)$/
      )
    );
    console.log(contentMarkdown);
    context.nextSectionIndex = 0;
    return metadata;
  } else {
    const { sections, nextSectionIndex } = context;
    if (nextSectionIndex < sections.length) {
      const section = sections[nextSectionIndex];
      context.nextSectionIndex++;
      // console.log(`Send the following secton: ${section.slice(0, 200)}`);
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
