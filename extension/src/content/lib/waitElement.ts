export function waitElement<T extends Element = Element>(
  selector: string,
): Promise<T> {
  return new Promise((resolve) => {
    const existing = document.querySelector<T>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector<T>(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  });
}
