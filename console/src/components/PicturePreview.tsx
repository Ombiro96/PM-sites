import { useEffect, useRef } from "react";
import type { Picture } from "../lib/site";
import { Button } from "./fields";

/** One picture drawn large over the page. Close, Escape or a click outside it puts it away. */
export function PicturePreview({
  picture,
  onClose,
}: {
  picture: Picture;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      aria-label={picture.description || "Picture"}
      className="m-auto max-w-[min(70rem,calc(100vw-2rem))] rounded-xl p-0 backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <p className="min-w-0 truncate font-semibold">
          {picture.description || "No name"}
          {picture.width && picture.height ? (
            <span className="text-ink-muted ml-2 text-sm font-normal">
              {picture.width} × {picture.height}
            </span>
          ) : null}
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
      <img
        src={picture.url}
        alt={picture.description}
        className="max-h-[75dvh] w-full object-contain"
      />
    </dialog>
  );
}
