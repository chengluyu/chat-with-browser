import { map } from "unist-util-map";

/**
 * Check whether the link is a citation
 * @param {string} text the link text
 * @param {string} link the link href
 * @param {[RegExp | null, RegExp, "flatten" | "remove" | undefined][]} patterns copatterns
 * @returns {"flatten" | "remove" | "noop"} whether the link is a citation
 */
function validatePattern(text, link, patterns) {
  for (const [textPattern, linkPattern, action] of patterns) {
    console.log(
      "  Testing pattern: ",
      textPattern,
      linkPattern,
      action ?? "flatten"
    );
    if (textPattern instanceof RegExp) {
      if (textPattern.test(text) && linkPattern.test(link)) {
        return action ?? "flatten";
      } else {
        continue;
      }
    } else {
      if (linkPattern.test(link)) {
        return action ?? "flatten";
      } else {
        continue;
      }
    }
  }
  return "noop";
}

/**
 *
 * @param {[RegExp | null, RegExp, "flatten" | "remove" | undefined][]} patterns
 * @param {*} root
 * @returns the transformed AST
 */
export default function removeCitations(patterns, root) {
  return map(root, (node, index, parent) => {
    if (
      node.type === "link" &&
      node.children.length === 1 &&
      node.children[0].type === "text"
    ) {
      const action = validatePattern(
        node.children[0].value,
        node.url,
        patterns
      );
      console.log(`${node.children[0].value} ${node.url} ${action}`);
      if (action === "flatten") {
        const soleChild = node.children[0];
        const previousSibling = index === 0 ? null : parent.children[index - 1];
        const nextSibling =
          index === parent.children.length - 1
            ? null
            : parent.children[index + 1];
        if (
          soleChild.value.match(/^\d+$/) &&
          previousSibling !== null &&
          previousSibling.type === "text" &&
          !previousSibling.value.endsWith("[") &&
          nextSibling !== null &&
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
            children: [],
          };
        } else {
          return soleChild;
        }
      } else if (action === "remove") {
        return { type: "text", value: "", children: [] };
      } else {
        return node;
      }
    } else {
      return node;
    }
  });
}
