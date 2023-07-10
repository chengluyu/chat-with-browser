import { map } from "unist-util-map";

/**
 *
 * @param {RegExp} textPattern the pattern of citation link text
 * @param {RegExp} linkPattern the pattern of citation link URL
 * @param {*} root
 * @returns the transformed AST
 */
export default function removeCitations(textPattern, linkPattern, root) {
  return map(root, (node) => {
    if (
      node.type === "link" &&
      node.children.length === 1 &&
      node.children[0].type === "text" &&
      textPattern.test(node.children[0].value) &&
      linkPattern.test(node.url)
    ) {
      return node.children[0];
    } else {
      return node;
    }
  });
}
