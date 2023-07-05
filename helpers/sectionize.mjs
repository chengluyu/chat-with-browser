import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";

/**
 *
 * @param {string} markdown
 * @returns {string[]}
 */
export default function sectionize(markdown) {
  const root = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  const sections = [];
  let section = [];
  for (const node of root.children) {
    if (node.type === "heading") {
      if (section.length > 0) {
        sections.push(section);
      }
      section = [];
    }
    section.push(node);
  }
  if (section.length > 0) {
    sections.push(section);
  }

  // Convert each section to markdown.
  const processor = unified().use(remarkStringify);
  const sectionMarkdowns = sections.map((section) => {
    const markdown = processor.stringify({
      type: "root",
      children: section,
    });
    return markdown;
  });
  return sectionMarkdowns;
}
