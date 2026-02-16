const createRoomButtonContainer = document.querySelector("#end");
if (createRoomButtonContainer === null)
  throw new Error("createRoom button container not found");

const createRoomButton = document.createElement("button");
createRoomButton.textContent = "Create Room";

createRoomButton.addEventListener("click", async () => {
  const roomId = await createRoom();
  console.log(roomId);
  const userId = await joinRoom(roomId);
  console.log(userId);
  connectRoom(userId, roomId);
});

createRoomButtonContainer.prepend(createRoomButton);
