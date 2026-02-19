const VIDEO_REGEXP =
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function getIdFromUrl(url: string): string | null {
  const match = url.match(VIDEO_REGEXP);
  return match ? match[1] : null;
}
