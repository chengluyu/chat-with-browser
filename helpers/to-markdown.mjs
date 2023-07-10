import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";

/**
 * Converts HTML to Markdown.
 * @param {string} html the HTML source
 * @returns {Promise<string>} the Markdown source
 */
export default async function toMarkdown(html) {
  const file = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);

  return String(file);
}
