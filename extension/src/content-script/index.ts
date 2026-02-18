const STORAGE_KEY_ROOM_ID = "st-room-id";
const STORAGE_KEY_AUTH_TOKEN = "st-auth-token";

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

  const authToken = await joinRoom(roomId);
  localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId);
  localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, authToken);

  // TODO(skewb1k): rename "Create Room" button.
  injectAddVideoInput();
  subscribe(authToken);
}

async function handleRoomURL(roomId: string): Promise<void> {
  let authToken: string;
  try {
    authToken = await joinRoom(roomId);
  } catch (err) {
    // TODO(skewb1k): display "Room Not Found" in case of error.
    console.error("Failed to join room:", err);
    return;
  }
  console.log("Joined room %s", roomId);

  localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId);
  localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, authToken);
  // TODO(skewb1k): open current video URL if present.
  window.location.href = "/";
}

async function handleStoredRoomId(roomId: string): Promise<void> {
  const authToken = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
  if (authToken === null) {
    throw new Error("Found stored room ID but missing auth token");
  }

  let room: Room;
  try {
    room = await getRoom(roomId);
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY_ROOM_ID);
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    console.log(
      "Failed to get room for stored ID %s; storage cleaned: %o",
      roomId,
      err,
    );
    return;
  }
  // TODO(skewb1k): YouTube can override URL back to '/', investigate how to
  // listen for such event and keep url updated.
  setRoomURL(roomId);
  console.log("Fetched room info for %s: %o", roomId, room);
  injectAddVideoInput();
  subscribe(authToken);
}

function injectCreateRoomButton(): void {
  const createRoomButtonContainer = document.querySelector("#end");
  if (createRoomButtonContainer === null) {
    throw new Error("createRoom button container not found");
  }
  const createRoomButton = document.createElement("button");
  createRoomButton.textContent = "Create Room";
  createRoomButton.addEventListener("click", handleCreateRoom);
  createRoomButtonContainer.prepend(createRoomButton);
}

function injectAddVideoInput(): void {
  const ytSearchBox = document.querySelector("yt-searchbox");
  if (ytSearchBox === null) {
    throw new Error("yt-searchbox not found");
  }
  const addVideoInput = document.createElement("input");
  addVideoInput.placeholder = "Add Video";
  addVideoInput.addEventListener("keypress", function (ev) {
    if (ev.key === "Enter") {
      ev.preventDefault();
    }
  });
  ytSearchBox.replaceWith(addVideoInput);
}

(async () => {
  console.log("Current URL:", location.href);
  const roomId = parseRoomURL(location.href);
  if (roomId !== null) {
    console.log("Room URL detected, room ID: %s", roomId);
    handleRoomURL(roomId);
    return;
  }

  injectCreateRoomButton();

  const storedRoomId = localStorage.getItem(STORAGE_KEY_ROOM_ID);
  if (storedRoomId !== null) {
    console.log("Found stored room ID: %s", storedRoomId);
    handleStoredRoomId(storedRoomId);
  }
})();
