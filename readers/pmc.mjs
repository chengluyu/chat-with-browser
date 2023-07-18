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
      const mainContentEl = document.querySelector("#mc");
      if (mainContentEl === null) {
        return null;
      }
      const source = mainContentEl.querySelector(".fm-citation").textContent;
      const identifiers = mainContentEl.querySelector(".fm-ids").textContent;
      const title = mainContentEl.querySelector(".content-title").textContent;
      const authors = mainContentEl.querySelector(".fm-author").textContent;

      const sections = Array.from(mainContentEl.querySelectorAll(".tsec.sec"));
      const abstract = sections.filter((el) =>
        el.id.match(/^(?:abstract-|ABS)\d+$/)
      );
      const mainSections = sections.filter((el) =>
        el.id.match(/^(?:body-|sec-|S|s)\d+$/)
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

      function extractSection(el, level) {
        const heading = el.querySelector(`h${level}`);
        const paragraphs = [];
        let current = el.id.match(/^(?:abstract-|ABS)\d+$/)
          ? heading.nextElementSibling.firstElementChild
          : heading.nextElementSibling;
        while (current !== null) {
          if (current.tagName === "P") {
            paragraphs.push(current.outerHTML);
          } else if (
            current.tagName === "DIV" &&
            (current.id.startsWith("sec-") ||
              current.id.match(/^(?:S\d+|s\d+(?:\.\d+)*)$/))
          ) {
            const { headingHTML, contentHTML } = extractSection(
              current,
              level + 1
            );
            paragraphs.push(headingHTML + "\n\n" + contentHTML);
          }
          current = current.nextElementSibling;
        }
        return {
          headingHTML: heading.classList.contains("headless")
            ? ""
            : heading.outerHTML,
          contentHTML: paragraphs.join("\n"),
        };
      }
    });
    const contentMarkdown = await toMarkdown(contentHTML);
    metadata.abstract = await toMarkdown(abstractHTML);
    context.metadata = metadata;
    context.sections = sectionize(
      contentMarkdown,
      removeCitations.bind(null, [
        [
          /^(?:[\w -]+?(?:et al\.)? \d\d\d\d|Fig. \d+\w*|\d+|Table \d+)$/,
          /^(?:#[BR]\d+|\/pmc\/articles\/PMC\d+\/(?:figure|table)\/\w+\/)$/,
        ],
        [/^\d+$/, /^#r\d+$/i], // number citations
        [/(?:\w+|\w+ and \w+|\w+ et al.), \d{4}$/, /#r\d+$/i], // citations
        [
          /Figures? \d+(?:[a-zA-Z](?:, [a-zA-Z])*)?$/,
          /\/pmc\/articles\/\w+\/figure\/\w+\/?$/,
        ], // figures
        [/(?:Figure )?S\d+$/, /#SD\d+$/], // supplementary figures
        [/Fig. S\d+(?:[A-Z](?:(?:\/| and )[A-Z])*)?$/, /#SD\d+$/], // supplementary figures
        [/Table S(?:I{1,3}|I?V|VI{3}|II?X|XI{1,3})$/, /#SD\d+$/], // supplementary tables
        [/./, /\/pmc\/articles\/\w+\/figure\/\w+\/?$/], // some malformed figures
        [/./, /#SD\d+$/], // some malformed figures
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
