const STORAGE_KEY_ROOM_ID = "st-room-id";
const STORAGE_KEY_USER_ID = "st-user-id";

function parseRoomURL(url: string): string | null {
  // TODO(skewb1k): consider validating roomId.
  const inviteMatch = url.match(/\/sharetube\/([^/?#]+)/);
  if (inviteMatch) {
    return inviteMatch[1];
  }
  return null;
}

function setRoomURL(roomId: string): void {
  const newPath = `/sharetube/${roomId}`;
  history.replaceState(null, "", newPath);
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

async function handleRoomURL(roomId: string): Promise<void> {
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

async function handleStoredRoomId(roomId: string): Promise<void> {
  const userId = localStorage.getItem(STORAGE_KEY_USER_ID);
  if (userId === null) {
    throw new Error("Found stored room ID but missing corresponding user ID");
  }
  setRoomURL(roomId);

  let room: Room;
  try {
    room = await getRoom(roomId);
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY_ROOM_ID);
    localStorage.removeItem(STORAGE_KEY_USER_ID);
    console.log(
      "Failed to get room for stored ID %s: %o; storage cleaned",
      roomId,
      err,
    );
    return;
  }
  console.log("Fetched room info for %s: %o", roomId, room);
  connectRoom(userId, roomId);
}

(async () => {
  console.log("Current URL:", location.href);
  const roomId = parseRoomURL(location.href);
  if (roomId !== null) {
    console.log("Room URL detected, room ID: %s", roomId);
    handleRoomURL(roomId);
  }

  const storedRoomId = localStorage.getItem(STORAGE_KEY_ROOM_ID);
  if (storedRoomId !== null) {
    console.log("Found stored room ID: %s", storedRoomId);
    handleStoredRoomId(storedRoomId);
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
