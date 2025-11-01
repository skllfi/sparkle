/**
 * A simple utility for conditionally joining classNames together
 * @param {...string} classes - Class names to join
 * @returns {string} - Joined class names
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
