export function parseRoomURL(url: string): string | null {
  // TODO(skewb1k): consider validating roomId.
  const inviteMatch = url.match(/\/sharetube\/([^/?#]+)/);
  if (inviteMatch) {
    return inviteMatch[1];
  }
  return null;
}

export function setRoomURL(roomId: string): void {
  const newPath = `/sharetube/${roomId}`;
  // TODO(skewb1k): YouTube can override URL back to '/', investigate how to listen for such event and keep url updated.
  history.replaceState(null, "", newPath);
  console.log("URL set to %s", newPath);
}
