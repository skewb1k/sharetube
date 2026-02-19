import { For } from "solid-js";
import style from "./Members.module.css";

const members = [
  {
    id: "sdada",
    isReady: true,
    nickname: "Pavel Durov",
  },
  {
    id: "dshcv",
    isReady: false,
    nickname: "Evgeny Ponasenkov",
  },
  {
    id: "fdf",
    isReady: true,
    nickname: "Pavel Durov",
  },
  {
    id: "fsdf",
    isReady: false,
    nickname: "Alexandr Pushkin",
  },
  {
    id: "fd",
    isReady: false,
    nickname: "Pavel Durov",
  },
  {
    id: "sa",
    isReady: true,
    nickname: "Valery Export",
  },
];

export function Members() {
  return (
    <ul class={style.members}>
      <For each={members}>
        {(member) => (
          <li
            class={style.member}
            classList={{ [style.member_state_loading]: !member.isReady }}
          >
            {member.nickname}
          </li>
        )}
      </For>
    </ul>
  );
}
