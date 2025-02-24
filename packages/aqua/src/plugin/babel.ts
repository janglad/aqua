import type { PluginObj } from "@babel/core";
import * as babelTypes from "@babel/types";

// Import Scope type

// This is AI generated slop right now. Probably can do better.
export function AquaPlugin({
  types: t,
}: {
  types: typeof babelTypes;
}): PluginObj {
  return {
    visitor: {
      CallExpression(path) {
        const { node, scope } = path;
        // Look for calls of the form: <something>.handler(...)
        if (
          t.isMemberExpression(node.callee) &&
          (t.isIdentifier(node.callee.property, { name: "handler" }) ||
            t.isIdentifier(node.callee.property, { name: "input" }) ||
            t.isIdentifier(node.callee.property, { name: "output" }))
        ) {
          // TODO: this replaces every handler, input, output call. Need to check if it's coming from us
          path.replaceWith(node.callee.object);
        }
      },
    },
  };
}
