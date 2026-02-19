import type { JSX } from "solid-js/jsx-runtime";
import style from "./Video.module.css";

export type Type = "previous" | "current" | "common";
export interface VideoProps extends Omit<
  JSX.HTMLAttributes<HTMLLIElement>,
  "class" | "classList"
> {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  type: Type;
}

export function Video({
  id,
  title,
  channel,
  thumbnail,
  type,
  ...props
}: VideoProps) {
  return (
    <li class={style.video} data-type={type} {...props}>
      <section class={style.left} aria-hidden="true">
        <span class={style.left__play}>▶</span>
        <svg
          class={style.left__handle}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M20 7H4C3.73478 7 3.48043 7.10536 3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8C3 8.26522 3.10536 8.51957 3.29289 8.70711C3.48043 8.89464 3.73478 9 4 9H20C20.2652 9 20.5196 8.89464 20.7071 8.70711C20.8946 8.51957 21 8.26522 21 8C21 7.73478 20.8946 7.48043 20.7071 7.29289C20.5196 7.10536 20.2652 7 20 7ZM20 15H4C3.73478 15 3.48043 15.1054 3.29289 15.2929C3.10536 15.4804 3 15.7348 3 16C3 16.2652 3.10536 16.5196 3.29289 16.7071C3.48043 16.8946 3.73478 17 4 17H20C20.2652 17 20.5196 16.8946 20.7071 16.7071C20.8946 16.5196 21 16.2652 21 16C21 15.7348 20.8946 15.4804 20.7071 15.2929C20.5196 15.1054 20.2652 15 20 15Z"
            fill="currentColor"
          />
        </svg>
      </section>
      <div
        class={style.thumbnail}
        role="img"
        aria-label={title}
        style={{ "background-image": `url(${thumbnail})` }}
      />
      <section class={style.middle}>
        <h2 class={style.title}>{title}</h2>
        <p class={style.channel}>{channel}</p>
      </section>
      <section class={style.right}>
        <button class={style.right__delete}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M19 3H15V2C15 1.73478 14.8946 1.48043 14.7071 1.29289C14.5196 1.10536 14.2652 1 14 1H10C9.73478 1 9.48043 1.10536 9.29289 1.29289C9.10536 1.48043 9 1.73478 9 2V3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5H21C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3ZM6 19V7H4V19C4 20.0609 4.42143 21.0783 5.17157 21.8284C5.92172 22.5786 6.93913 23 8 23H16C17.0609 23 18.0783 22.5786 18.8284 21.8284C19.5786 21.0783 20 20.0609 20 19V7H18V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H8C7.46957 21 6.96086 20.7893 6.58579 20.4142C6.21071 20.0391 6 19.5304 6 19ZM10 8C9.73478 8 9.48043 8.10536 9.29289 8.29289C9.10536 8.48043 9 8.73478 9 9V17C9 17.2652 9.10536 17.5196 9.29289 17.7071C9.48043 17.8946 9.73478 18 10 18C10.2652 18 10.5196 17.8946 10.7071 17.7071C10.8946 17.5196 11 17.2652 11 17V9C11 8.73478 10.8946 8.48043 10.7071 8.29289C10.5196 8.10536 10.2652 8 10 8ZM14 8C13.7348 8 13.4804 8.10536 13.2929 8.29289C13.1054 8.48043 13 8.73478 13 9V17C13 17.2652 13.1054 17.5196 13.2929 17.7071C13.4804 17.8946 13.7348 18 14 18C14.2652 18 14.5196 17.8946 14.7071 17.7071C14.8946 17.5196 15 17.2652 15 17V9C15 8.73478 14.8946 8.48043 14.7071 8.29289C14.5196 8.10536 14.2652 8 14 8Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </section>
    </li>
  );
}
