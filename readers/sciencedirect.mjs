// import TurndownService from "turndown";
import sectionize from "../helpers/sectionize.mjs";
import removeCitations from "../helpers/rm-cite.mjs";
import toMarkdown from "../helpers/to-markdown.mjs";

// const turndownService = new TurndownService();

/**
 * Read content from ScienceDirect.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
async function read(page, context) {
  // First time? Get metadata.
  if (!("metadata" in context)) {
    const { metadata, abstractHTML, contentHTML } = await page.evaluate(() => {
      const main = document.querySelector("article[role='main']");
      if (main === null) {
        return null;
      }
      const journal = main.querySelector(
        "#screen-reader-main-title > .article-dochead"
      )?.textContent;
      const title = main.querySelector(
        "#screen-reader-main-title > .title-text"
      ).textContent;
      const authors = Array.from(
        main.querySelectorAll("#author-group > .button-link-text")
      ).map((el) => el.firstElementChild.innerText);
      const abstractHTML = main.querySelector("#abstracts").innerHTML;
      return {
        metadata: { journal, title, authors },
        abstractHTML,
        contentHTML: main.querySelector("#body").innerHTML,
      };
    });
    let contentMarkdown;
    try {
      metadata.abstract = await toMarkdown(abstractHTML);
      contentMarkdown = await toMarkdown(contentHTML);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes("Cannot handle unknown node")
      ) {
        console.log(`Error when convert to markdown: ${e.message}`);
      } else {
        contentMarkdown = "";
      }
    }
    context.metadata = metadata;
    context.sections = sectionize(
      contentMarkdown,
      removeCitations.bind(null, [
        [/^(?:\d+|Fig. \d+)$/, /^(?:#bib\d+|#fig\d+)$/],
        [null, /^#(?:bib|tbl(?:fn)?|fig)\d+$/i],
        [/^$/, /./, "remove"],
        // [null, /^\/science\/article\/pii\/\w+$/],
      ])
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
 * Load more content from ScienceDirect.
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
  name: "ScienceDirect",
  urlPattern: /^https?:\/\/www.sciencedirect.com\/science\/article\/pii\/.+$/,
  read,
  loadMore,
};
