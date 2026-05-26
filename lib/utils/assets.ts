import { getAssetsBaseUrl } from "@/lib/api/config";

const R2_STORAGE_RE =
  /^https?:\/\/[^/]+\.r2\.cloudflarestorage\.com\/(.+)$/i;

/**
 * Rewrite private R2 storage URLs to a public assets base URL.
 * The API stores `*.r2.cloudflarestorage.com/...` which is not directly loadable in the app.
 */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const publicBase = getAssetsBaseUrl();
  const r2Match = trimmed.match(R2_STORAGE_RE);

  if (r2Match && publicBase) {
    return `${publicBase}/${r2Match[1]}`;
  }

  return trimmed;
}

export function isPrivateStorageUrl(url: string): boolean {
  return R2_STORAGE_RE.test(url);
}
