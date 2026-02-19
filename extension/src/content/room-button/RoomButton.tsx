import style from "./RoomButton.module.css";
import { handleCreateRoom } from "./handleCreateRoom";

export function RoomButton() {
  return (
    <button onClick={handleCreateRoom} class={style.create}>
      <svg
        class={style.create__icon}
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"
      >
        <path
          fill="currentColor"
          d="M12 3a1 1 0 00-1 1v7H4a1 1 0 000 2h7v7a1 1 0 002 0v-7h7a1 1 0 000-2h-7V4a1 1 0 00-1-1Z"
        ></path>
      </svg>
      <p class={style.create__title}>Create room</p>
    </button>
  );
}
