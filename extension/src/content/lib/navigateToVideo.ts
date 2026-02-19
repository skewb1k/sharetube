export function navigateToVideo(ytId: string): void {
  const ytdApp = document.querySelector("ytd-app");
  ytdApp!.dispatchEvent(
    new CustomEvent("yt-navigate", {
      detail: {
        endpoint: {
          commandMetadata: {
            webCommandMetadata: {
              url: `/watch?v=${ytId}`,
            },
          },
        },
      },
    }),
  );
}
