/**
 * Resolves media URLs to work in any environment.
 * - Cloudinary / https URLs: returned as-is
 * - Old hardcoded http://localhost:8000/... URLs: stripped to relative path
 * - Relative /uploads/... paths: returned as-is (proxied by Next.js)
 */
export function mediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("https://")) return url;
  if (url.startsWith("http://")) {
    try { return new URL(url).pathname; } catch { return url; }
  }
  return url;
}
