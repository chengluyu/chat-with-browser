import sectionize from "../helpers/sectionize.mjs";
import removeCitations from "../helpers/rm-cite.mjs";
import toMarkdown from "../helpers/to-markdown.mjs";

/**
 * Read content from ACS Publications.
 * @param {import("puppeteer").Page} page the web page
 * @param {Record<string, unknown>} context the reader context
 * @returns {Promise<string>}
 */
async function read(page, context) {
  // First time? Get metadata.
  if (!("metadata" in context)) {
    const { metadata, abstractHTML, contentHTML } = await page.evaluate(() => {
      const header = document.querySelector(".article_header");
      const main = document.querySelector(".article_content");
      if (header === null || main === null) {
        return null;
      }
      const title = header
        .querySelector(".article_header-title")
        .textContent.trim();
      const authors = Array.from(
        header.querySelectorAll(".loa.non-jats-loa > li:not(.comma-separator)")
      ).map((el) => el.textContent.trim());
      const abstractHTML = "";
      const contentHTML = Array.from(main.querySelectorAll(".NLM_sec_level_1"))
        .map(walkSection)
        .join("");
      return {
        metadata: { title, authors },
        abstractHTML,
        contentHTML,
      };
      /** @param {HTMLElement} node  */
      function walkSection(node) {
        const PREFIX = "NLM_sec_level_";
        const className = Array.from(node.classList).find((x) =>
          x.startsWith(PREFIX)
        );
        if (className === undefined) {
          return;
        }
        const level = parseInt(className.slice(PREFIX.length), 10);
        const headingEl = node.querySelector(`h${level + 1}`);
        const contentEl = [];
        let current =
          level === 1
            ? node.querySelector(".article_content-header")
            : node.querySelector(".article-section__title");
        while (current.nextElementSibling !== null) {
          current = current.nextElementSibling;
          if (current.tagName === "HR") {
            continue;
          } else if (current.tagName === "DIV") {
            if (current.classList.contains("NLM_p")) {
              contentEl.push(`<p>${current.innerHTML}</p>`);
            } else {
              contentEl.push(walkSection(current));
            }
          } else if (current.tagName === "FIGURE") {
            contentEl.push(current.outerHTML);
          } else {
            continue;
          }
        }
        return headingEl.outerHTML + contentEl.join("");
      }
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
        [null, /javascript:void\(0\);/, "remove"],
        [/^(?:)$/, /./, "remove"],
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
  name: "ACS Publications",
  urlPattern: /^https:\/\/pubs.acs.org\/doi\/.*$/,
  read,
  loadMore,
};
