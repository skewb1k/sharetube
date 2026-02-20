const KEY_ROOM_ID = "st-room-id";
const KEY_AUTH_TOKEN = "st-auth-token";

function mustGet(keyName: string): string {
  const value = localStorage.getItem(keyName);
  if (value === null) {
    throw new Error(`${keyName} not found in localStorage`);
  }
  return value;
}

export function getRoomId(): string {
  return mustGet(KEY_ROOM_ID);
}

export function getAuthToken(): string {
  return mustGet(KEY_AUTH_TOKEN);
}

export function setRoomId(roomId: string): void {
  localStorage.setItem(KEY_ROOM_ID, roomId);
}

export function setAuthToken(authToken: string): void {
  localStorage.setItem(KEY_AUTH_TOKEN, authToken);
}

export function removeRoomId(): void {
  localStorage.removeItem(KEY_ROOM_ID);
}

export function removeAuthToken(): void {
  localStorage.removeItem(KEY_AUTH_TOKEN);
}
