const createRoomButtonContainer = document.querySelector("#end");
if (createRoomButtonContainer === null)
  throw new Error("createRoom button container not found");

const createRoomButton = document.createElement("button");
createRoomButton.textContent = "Create Room";

createRoomButton.addEventListener("click", async () => {
  const roomId = await createRoom();
  console.log(roomId);
  const joinRoomResp = await joinRoom(roomId);
  console.log(joinRoomResp);
  connectRoom(joinRoomResp.user_id, roomId);
});

createRoomButtonContainer.prepend(createRoomButton);
