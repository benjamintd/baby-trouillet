const normalizeString = (str: string) =>
  str
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

export default normalizeString;
