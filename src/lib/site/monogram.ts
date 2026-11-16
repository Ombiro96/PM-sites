/** Letters for the generated tab icon, home-screen icon and wordmark. */
export function monogram(name: string): string {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase();
}
