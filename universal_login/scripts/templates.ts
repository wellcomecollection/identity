// For strings containing templates like {{key}}, this replaces that
// template with value corresponding to the key `key` in the `data` object
export const applyTemplates = (
  originalString: string,
  data: Record<string, string>
): string => {
  const templatedKeys = Object.keys(data);
  // Only match template strings for which we have data
  const templatedKeysRegex = templatedKeys.map((key) => `(${key})`).join('|');
  const templateRegex = new RegExp(`{{(${templatedKeysRegex})}}`, 'g');
  return originalString.replace(templateRegex, (_, key) => data[key]);
};
