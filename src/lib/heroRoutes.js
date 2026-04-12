/**
 * Returns true if the current pathname belongs to a page whose hero
 * extends behind the navbar (transparent navbar, no top padding on main).
 */
const EXACT = new Set([
  "/",
  "/experiences",
  "/about",
  "/contact",
  "/publications",
  "/passes",
]);

const PREFIXES = ["/experiences/", "/packages/", "/passes/"];

export default function isHeroRoute(pathname) {
  if (EXACT.has(pathname)) return true;
  return PREFIXES.some((p) => pathname.startsWith(p));
}
