async function createRoom(): Promise<string> {
  const response = await fetch("$ST_HOST/room", {
    method: "POST",
  });
  const roomId = response.text();
  return roomId;
}

const createRoomButtonContainer = document.querySelector("#end");
if (createRoomButtonContainer === null)
  throw new Error("createRoom button container not found");

const createRoomButton = document.createElement("button");
createRoomButton.textContent = "Create Room";

createRoomButton.addEventListener("click", async () => {
  const roomId = await createRoom();
  console.log(roomId);
});

createRoomButtonContainer.prepend(createRoomButton);
