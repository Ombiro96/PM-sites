import { useEffect, useRef, useState } from "react";
import type { Picture } from "../lib/site";
import { Button } from "./fields";
import { PictureLibrary } from "./PictureLibrary";

/** The picture library over the page, for picking the picture a section shows. */
export function PictureChooser({
  pictures,
  chosenId,
  onAdded,
  onChoose,
  onClose,
}: {
  pictures: readonly Picture[];
  chosenId?: string;
  onAdded: (picture: Picture) => void;
  onChoose: (picture: Picture) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pickedId, setPickedId] = useState(chosenId);
  const picked = pictures.find((each) => each.id === pickedId);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label="Choose a picture"
      className="m-auto w-[min(60rem,calc(100vw-2rem))] rounded-xl p-0 backdrop:bg-black/40"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <h2 className="border-line border-b px-5 py-4 text-lg font-semibold">
          Choose a picture
        </h2>
        <div className="overflow-y-auto p-5">
          <PictureLibrary
            pictures={pictures}
            chosenId={pickedId}
            onChoose={(picture) => setPickedId(picture.id)}
            onAdded={onAdded}
          />
        </div>
        <div className="border-line flex justify-end gap-3 border-t px-5 py-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            tone="solid"
            disabled={!picked}
            onClick={() => {
              if (picked) onChoose(picked);
            }}
          >
            Use this picture
          </Button>
        </div>
      </div>
    </dialog>
  );
}
