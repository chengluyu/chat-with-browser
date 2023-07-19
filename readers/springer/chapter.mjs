import sectionize from "../../helpers/sectionize.mjs";
import removeCitations from "../../helpers/rm-cite.mjs";
import toMarkdown from "../../helpers/to-markdown.mjs";

/**
 * Read content from SpringerLink book chapters.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
async function read(page, context) {
  // First time? Get metadata.
  if (!("metadata" in context)) {
    const { metadata, abstractHTML, contentHTML } = await page.evaluate(() => {
      const main = document.querySelector(
        "main.c-article-main-column > article"
      );
      if (main === null) {
        return null;
      }
      const title = main.querySelector("h1.c-article-title").textContent.trim();
      const authors = Array.from(
        main.querySelectorAll(".c-article-author-list__item > .author-name")
      ).map((el) => el.textContent.trim());
      const abstractHTML = main.querySelector(
        "section[data-title='Abstract'] div.c-article-section__content"
      ).innerHTML;
      return {
        metadata: { title, authors },
        abstractHTML,
        contentHTML: main.querySelector(".main-content").innerHTML,
      };
    });
    // HTML to Markdown
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
        [null, /^#ref-CR\d+/],
        [null, /^#(?:bib|tbl(?:fn)?|Fig)\d+$/],
        [/^Full size image$/, /./, "remove"],
        [/^figure \d+$/, /./],
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
  name: "SpringerLink Book Chapter",
  urlPattern: /^https:\/\/link\.springer\.com\/chapter\/.*$/,
  read,
  loadMore,
};
