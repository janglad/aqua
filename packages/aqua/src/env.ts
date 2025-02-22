export const pathPrefix: `/${string}` = (() => {
  // TODO: check for invalid values in this
  const envValue = process.env.NEXT_PUBLIC_AQUA_PATH_PREFIX;

  if (envValue === undefined) {
    return "/aqua";
  }

  if (envValue.startsWith("/")) {
    return envValue as `/${string}`;
  }

  return `/${envValue}` as `/${string}`;
})();
