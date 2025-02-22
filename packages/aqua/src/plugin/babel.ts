// @ts-nocheck
// This is AI generated slop right now. Probably can do better.
export function AquaPlugin({ types: t }) {
  // Walks up the chain to find the root expression.
  function getChainRoot(node) {
    let current = node;
    // For chained calls like: createAquaFunction("/test").input(...).handler(...)
    // we keep walking back until we get the original expression.
    while (
      t.isCallExpression(current) &&
      t.isMemberExpression(current.callee)
    ) {
      current = current.callee.object;
    }
    return current;
  }

  // Checks whether the root of the chain comes from a call to createAquaFunction.
  // It handles cases where the function call is used directly or stored in a variable.
  function isChainFromCreateAquaFunction(root, scope) {
    // Case 1: The chain starts directly with a call expression:
    // e.g. createAquaFunction("/test")
    if (t.isCallExpression(root)) {
      let callee = root.callee;
      if (t.isIdentifier(callee)) {
        const binding = scope.getBinding(callee.name);
        if (
          binding &&
          binding.path.isImportSpecifier() &&
          binding.path.node.imported.name === "createAquaFunction"
        ) {
          return true;
        }
      }
    }
    // Case 2: The chain root is an identifier (e.g. a variable holding the result).
    // e.g.
    //   const fn = createAquaFunction("/test");
    //   export const myFunction = fn.input(...).handler(...);
    else if (t.isIdentifier(root)) {
      const binding = scope.getBinding(root.name);
      if (binding && binding.path.isVariableDeclarator()) {
        const init = binding.path.node.init;
        if (t.isCallExpression(init)) {
          let callee = init.callee;
          if (t.isIdentifier(callee)) {
            const binding2 = binding.path.scope.getBinding(callee.name);
            if (
              binding2 &&
              binding2.path.isImportSpecifier() &&
              binding2.path.node.imported.name === "createAquaFunction"
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
          if (isChainFromCreateAquaFunction(root, scope)) {
            // Replace the entire .handler(...) call with its receiver.
            // This effectively strips the handler (and its contents) from the chain.
            path.replaceWith(node.callee.object);
          }
        }
      },
    },
  };
}
