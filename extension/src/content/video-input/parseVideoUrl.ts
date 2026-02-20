const VIDEO_URL_REGEXP =
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function parseVideoUrl(url: string): string | null {
  const match = url.match(VIDEO_URL_REGEXP);
  return match ? match[1] : null;
}
