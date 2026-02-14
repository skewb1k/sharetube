const createRoomButtonContainer = document.querySelector("#end");
if (createRoomButtonContainer === null)
  throw new Error("createRoom button container not found");

const createRoomButton = document.createElement("button");
createRoomButton.textContent = "Create Room";

createRoomButton.addEventListener("click", async () => {
  const roomId = await chrome.runtime.sendMessage({ method: "createRoom" });
  console.log(roomId);
});

createRoomButtonContainer.prepend(createRoomButton);
