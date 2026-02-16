const STORAGE_KEY_ROOM_ID = "st-room-id";
const STORAGE_KEY_USER_ID = "st-user-id";

function parseInviteURL(url: string): string | null {
  const inviteMatch = url.match(/\/sharetube\/([^/?#]+)/);
  if (inviteMatch) {
    return inviteMatch[1];
  }
  return null;
}

function setRoomURL(roomId: string): void {
  const newPath = `/sharetube/${roomId}`;
  history.pushState({}, "", newPath);
  console.log("URL set to %s", newPath);
}

async function handleCreateRoom(): Promise<void> {
  const storedRoomId = localStorage.getItem(STORAGE_KEY_ROOM_ID);
  if (storedRoomId !== null) {
    throw new Error(
      `Expected stored room ID to be empty, found ${storedRoomId}`,
    );
  }
  const roomId = await createRoom();
  setRoomURL(roomId);

  const userId = await joinRoom(roomId);
  localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId);
  localStorage.setItem(STORAGE_KEY_USER_ID, userId);

  connectRoom(userId, roomId);
}

async function handleInvite(roomId: string): Promise<void> {
  let userId: string;
  try {
    userId = await joinRoom(roomId);
  } catch (err) {
    // TODO(skewb1k): display "Room Not Found" in case of error.
    console.error("Failed to join room:", err);
    return;
  }
  console.log("Joined room %s with userid %s", roomId, userId);

  localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId);
  localStorage.setItem(STORAGE_KEY_USER_ID, userId);
  // TODO(skewb1k): open current video URL if present.
  window.location.href = "/";
}

(async () => {
  console.log("Current URL:", location.href);
  const inviteRoomId = parseInviteURL(location.href);
  if (inviteRoomId !== null) {
    console.log("Invite detected, room ID: %s", inviteRoomId);
    handleInvite(inviteRoomId);
    return;
  }

  const roomId = localStorage.getItem(STORAGE_KEY_ROOM_ID);
  if (roomId !== null) {
    console.log("Found stored room ID: %s", roomId);
    const userId = localStorage.getItem(STORAGE_KEY_USER_ID);
    if (userId === null) {
      throw new Error("Found stored room ID but missing corresponding user ID");
    }
    setRoomURL(roomId);
    const room = await getRoom(roomId);
    console.log("Fetched room info for %s: %o", roomId, room);
    connectRoom(userId, roomId);
  }

  const createRoomButtonContainer = document.querySelector("#end");
  if (createRoomButtonContainer === null) {
    throw new Error("createRoom button container not found");
  }

  const createRoomButton = document.createElement("button");
  createRoomButton.textContent = "Create Room";

  createRoomButton.addEventListener("click", handleCreateRoom);

  createRoomButtonContainer.prepend(createRoomButton);
})();
