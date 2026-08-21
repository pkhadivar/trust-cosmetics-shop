// مسیر: src/utils/media.ts

export function getMediaUrl(path: string | undefined | null): string {
  if (!path) return "/placeholder.jpg";

  // اگر مسیر از قبل با http شروع شده بود، همان را برگردان
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "";
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${cleanBaseUrl}/${cleanPath}`;
}
