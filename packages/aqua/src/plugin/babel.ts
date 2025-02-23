import type { NodePath, PluginObj } from "@babel/core";
import * as babelTypes from "@babel/types";

// Import Scope type

// This is AI generated slop right now. Probably can do better.
export function AquaPlugin({
  types: t,
}: {
  types: typeof babelTypes;
}): PluginObj {
  // Walks up the chain to find the root expression.
  function getChainRoot(node: babelTypes.Expression) {
    let current = node;
    // For chained calls like: AquaFunction.query("queryOne").input(...).handler(...)
    // we keep walking back until we get the original expression.
    while (
      t.isCallExpression(current) &&
      t.isMemberExpression(current.callee)
    ) {
      current = current.callee.object;
    }
    return current;
  }

  // Checks whether the root of the chain comes from AquaFunction.query or AquaFunction.mutation.
  function isChainFromAquaFunction(
    root: babelTypes.Expression,
    scope: NodePath["scope"],
  ) {
    // Case 1: The chain starts directly with a call expression:
    // e.g. AquaFunction.query("queryOne")
    if (t.isCallExpression(root)) {
      const callee = root.callee;
      if (t.isMemberExpression(callee)) {
        const object = callee.object;
        const property = callee.property;

        // Check if the object is AquaFunction and the property is query or mutation
        if (
          t.isIdentifier(object, { name: "AquaFunction" }) &&
          (t.isIdentifier(property, { name: "query" }) ||
            t.isIdentifier(property, { name: "mutation" }))
        ) {
          return true;
        }
      }
    }

    // Case 2: The chain root is an identifier (e.g., a variable holding the result).
    // e.g.
    //   const fn = AquaFunction.query("queryOne");
    //   export const myFunction = fn.input(...).handler(...);
    else if (t.isIdentifier(root)) {
      const binding = scope.getBinding(root.name);
      if (binding && binding.path.isVariableDeclarator()) {
        const init = binding.path.node.init;
        if (t.isCallExpression(init)) {
          const callee = init.callee;
          if (t.isMemberExpression(callee)) {
            const object = callee.object;
            const property = callee.property;

            // Check if the object is AquaFunction and the property is query or mutation
            if (
              t.isIdentifier(object, { name: "AquaFunction" }) &&
              (t.isIdentifier(property, { name: "query" }) ||
                t.isIdentifier(property, { name: "mutation" }))
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

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
          const root = getChainRoot(node);
          if (isChainFromAquaFunction(root, scope) || true) {
            // Replace the entire .handler(...) call with its receiver.
            // This effectively strips the handler (and its contents) from the chain.
            path.replaceWith(node.callee.object);
          }
        }
      },
    },
  };
}
