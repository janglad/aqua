import type { NodePath, PluginObj } from "@babel/core";
import * as babelTypes from "@babel/types";

// Import Scope type

// This is AI generated slop right now. Probably can do better.
export function RemoveFromClient({
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

        if (
          t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: "AquaFunction" }) &&
          (t.isIdentifier(node.callee.property, { name: "mutation" }) ||
            t.isIdentifier(node.callee.property, { name: "query" }))
        ) {
          const args = node.arguments;
          const objArg = args[0];
          if (args.length !== 1 || !t.isObjectExpression(objArg)) {
            console.error("Expected arg length one for query/mutation");
            return;
          }

          const properties = objArg.properties;

          const idProperty = properties.find(
            (prop) =>
              t.isObjectProperty(prop) &&
              ((t.isIdentifier(prop.key) && prop.key.name === "id") ||
                (t.isStringLiteral(prop.key) && prop.key.value === "id")),
          );

          if (
            !idProperty ||
            !t.isObjectProperty(idProperty) ||
            !t.isStringLiteral(idProperty.value)
          ) {
            console.error("Expected id property for query/mutation");
            return;
          }

          const id = idProperty.value.value;

          // Add a comment to file for debugging purposes
          t.addComment(node, "leading", `aqua-rpc-id: ${id}`);
        }
      },
    },
  };
}

/**
 * Find the ID given to an rpc route.
 *
 * Either by using `AquaFunction.query({id: ""})` or `AquaFunction.mutation({id: ""})`
 */
const getRpcId = (path: NodePath<babelTypes.Program>) => {};

export function createRpcRoute({
  types,
}: {
  types: typeof babelTypes;
}): PluginObj {
  return {
    visitor: {
      Program() {},
    },
  };
}
