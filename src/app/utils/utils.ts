export const shortenDesc = (desc: string, maxLength: number) => {
  const minLength = 10;

  if (desc.length <= maxLength) return desc;
  const truncated = desc.substring(0, maxLength);

  const nIndex = desc.indexOf("\n");
  // prefer line break
  if (nIndex > minLength && nIndex < maxLength) {
    return desc.substring(0, nIndex);
  }

  // if no line breaks, try "."
  const perIndex = truncated.lastIndexOf(".");
  if (perIndex > minLength && perIndex < maxLength) {
    return truncated.substring(0, perIndex + 1);
  }

  // else try last space before max
  const spaceIndex = truncated.lastIndexOf(" ");
  if (spaceIndex > minLength && spaceIndex < maxLength) {
    return truncated.substring(0, spaceIndex) + "...";
  }

  // otherwise return truncated string
  if (desc.length > maxLength) {
    return desc.substring(0, maxLength);
  }

  return desc;
};
