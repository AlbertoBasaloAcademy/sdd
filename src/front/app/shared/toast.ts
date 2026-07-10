export type ToastKind = "success" | "error";

const TOAST_DURATION_MS = 4000;

const ensureContainer = (): HTMLElement => {
  let container = document.querySelector<HTMLElement>("#toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
};

export const showToast = (message: string, kind: ToastKind = "success"): void => {
  const container = ensureContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast-${kind}`;
  toast.textContent = message;
  container.appendChild(toast);

  globalThis.setTimeout(() => {
    toast.remove();
    if (container.childElementCount === 0) {
      container.remove();
    }
  }, TOAST_DURATION_MS);
};
