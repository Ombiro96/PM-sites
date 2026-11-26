const NAME_MAX = 120;

/** A picture is named after its file, without the ending and with its dashes read as spaces. */
export function nameFromFile(fileName: string): string {
  const name = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_\s]+/g, " ")
    .trim();
  return (name || "Picture").slice(0, NAME_MAX);
}
