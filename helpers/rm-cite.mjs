import { map } from "unist-util-map";

/**
 * Check whether the link is a citation
 * @param {string} text the link text
 * @param {string} link the link href
 * @param {[RegExp | null, RegExp][]} patterns copatterns
 * @returns {boolean} whether the link is a citation
 */
function validatePattern(text, link, patterns) {
  return patterns.some(([textPattern, linkPattern]) => {
    return (
      (textPattern ? textPattern.test(text) : true) && linkPattern.test(link)
    );
  });
}

/**
 *
 * @param {[RegExp | null, RegExp][]} patterns
 * @param {*} root
 * @returns the transformed AST
 */
export default function removeCitations(patterns, root) {
  return map(root, (node, index, parent) => {
    if (
      node.type === "link" &&
      node.children.length === 1 &&
      node.children[0].type === "text" &&
      validatePattern(node.children[0].value, node.url, patterns)
    ) {
      const soleChild = node.children[0];
      const previousSibling = index === 0 ? null : parent.children[index - 1];
      const nextSibling =
        index === parent.children.length - 1
          ? null
          : parent.children[index + 1];
      if (
        soleChild.value.match(/^\d+$/) &&
        previousSibling.type === "text" &&
        !previousSibling.value.endsWith("[") &&
        nextSibling.type === "text" &&
        !nextSibling.value.startsWith("]")
      ) {
        return {
          type: "text",
          value:
            (previousSibling.value.match(/\w$/) ? " " : "") +
            "[" +
            soleChild.value +
            "]",
        };
      } else {
        return soleChild;
      }
    } else {
      return node;
    }
  });
}
