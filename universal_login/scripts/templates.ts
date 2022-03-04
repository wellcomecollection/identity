// For strings containing templates like {{key}}, this replaces that
// template with value corresponding to the key `key` in the `data` object
export const applyTemplates = (
  originalString: string,
  data: Record<string, string>
): string => originalString.replace(/{{(.+)}}/g, (_, key) => data[key]);
