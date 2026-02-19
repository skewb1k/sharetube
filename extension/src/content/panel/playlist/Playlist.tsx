import { createSignal, For } from "solid-js";
import { Video } from "./Video";
import style from "./Playlist.module.css";

const initVideos = [
  {
    id: "1a",
    ytid: "gg",
    title:
      "ЦЕНЫ, ИНФЛЯЦИЯ, НАЛОГИ, ПЕНСИИ. КАК УСТРОЕНА ЭКОНОМИКА? Семихатов, Сурдин, Мячин ddfdfd",
    channel: "Какая часть территории России непригодна для жизни?",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    id: "1a",
    ytid: "gg",
    title:
      "ЦЕНЫ, ИНФЛЯЦИЯ, НАЛОГИ, ПЕНСИИ. КАК УСТРОЕНА ЭКОНОМИКА? Семихатов, Сурдин, Мячин",
    channel: "Какая часть территории России непригодна для жизни?",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    id: "1a",
    ytid: "as",
    title:
      "ЦЕНЫ, ИНФЛЯЦИЯ, НАЛОГИ, ПЕНСИИ. КАК УСТРОЕНА ЭКОНОМИКА? Семихатов, Сурдин, Мячин",
    channel: "Какая часть территории России непригодна для жизни?",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    id: "1a",
    ytid: "as",
    title:
      "ЦЕНЫ, ИНФЛЯЦИЯ, НАЛОГИ, ПЕНСИИ. КАК УСТРОЕНА ЭКОНОМИКА? Семихатов, Сурдин, Мячин",
    channel: "Какая часть территории России непригодна для жизни?",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },

  {
    id: "1ba",
    ytid: "as",
    title: "1",
    channel: "ОСНОВА",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    id: "1aa",
    ytid: "as",
    title: "Инфляционная космология и мультиверс / Александр Панов",
    channel: "ОСНОВА",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    id: "1az",
    ytid: "as",
    title: "2 космология и мультиверс / Александр Панов",
    channel: "Z",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    id: "1ay",
    ytid: "as",
    title: "3 космология и мультиверс / Александр Панов",
    channel: "ОСНОВА",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    id: "1ao",
    ytid: "as",
    title: "Инфляционная космология и мультиверс / Александр Панов",
    channel: "ОСНОВА",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
  {
    ytid: "as",
    id: "1",
    title: "Инфляционная космология и мультиверс / Александр Панов",
    channel: "V",
    thumbnail:
      "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
  },
];

const previous = {
  id: "h",
  title: "Инфляционная космология и мультиверс / Александр Панов",
  channel: "ОСНОВА",
  thumbnail:
    "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
};

const current = {
  id: "h",
  title: "Инфляционная космология и мультиверс / Александр Панов",
  channel: "ОСНОВА",
  thumbnail:
    "https://s0.rbk.ru/v6_top_pics/media/img/5/74/347708068135745.jpeg",
};

export function Playlist() {
  const [videos, setVideos] = createSignal(initVideos);
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);

  function moveVideo(from: number, to: number) {
    if (from === to) return;

    setVideos((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(from, 1);
      updated.splice(to, 0, item);
      return updated;
    });
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleDrop(index: number) {
    const from = dragIndex();
    if (from === null) return;

    moveVideo(from, index);
    setDragIndex(null);
  }

  return (
    <div class={style.playlist}>
      <ul class={style.list}>
        <Video type="previous" {...previous} />
        <Video type="current" {...current} />
        <For each={videos()}>
          {(video, index) => {
            const i = index();
            return (
              <Video
                type="common"
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={() => handleDrop(i)}
                draggable={true}
                {...video}
              />
            );
          }}
        </For>
      </ul>
      <div class={style.footer} aria-hidden />
    </div>
  );
}
