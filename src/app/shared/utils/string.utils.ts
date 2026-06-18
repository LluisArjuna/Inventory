export const truncate = (text: string | undefined | null, max = 15): string => {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
};
