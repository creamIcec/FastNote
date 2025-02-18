export function escape(str: string) {
  return str.replaceAll(/<|>|:|"|\/|\\|\||\*|\?/g, "_");
}
