import { useRef, useState } from "react";
import { PicturePreview } from "./PicturePreview";
import { nameFromFile } from "../lib/pictures";
import {
  PICTURE_BYTES_MAX,
  PICTURE_TYPES,
  PICTURES_MAX,
  uploadPicture,
  type Picture,
} from "../lib/site";

/**
 * Every picture the account holds, with the one place to upload more, several at a time.
 * With `onChoose` a picture can be picked from it.
 */
export function PictureLibrary({
  pictures,
  used,
  chosenId,
  onChoose,
  onAdded,
}: {
  pictures: readonly Picture[];
  /** The pages each picture is on, said under it when given. */
  used?: Map<string, string[]>;
  chosenId?: string;
  onChoose?: (picture: Picture) => void;
  onAdded: (picture: Picture) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ at: number; of: number } | null>(
    null,
  );
  const [problems, setProblems] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState<Picture | null>(null);
  const uploaded = pictures.filter((each) => each.source === "upload").length;
  const full = uploaded >= PICTURES_MAX;

  const upload = async (files: File[]) => {
    if (progress || files.length === 0) return;
    const found: string[] = [];
    const taken: File[] = [];
    for (const file of files) {
      if (!PICTURE_TYPES.includes(file.type) || file.size > PICTURE_BYTES_MAX)
        found.push(
          `${file.name}: upload a JPEG, PNG or WebP picture of up to 10 MB.`,
        );
      else if (uploaded + taken.length >= PICTURES_MAX)
        found.push(
          `${file.name}: an account holds at most ${PICTURES_MAX} uploaded pictures.`,
        );
      else taken.push(file);
    }
    let last: Picture | undefined;
    for (const [at, file] of taken.entries()) {
      setProgress({ at: at + 1, of: taken.length });
      try {
        const result = await uploadPicture({
          file,
          description: nameFromFile(file.name),
        });
        if (result.ok) {
          onAdded(result.picture);
          last = result.picture;
        } else found.push(`${file.name}: ${result.message}`);
      } catch (error) {
        found.push(
          `${file.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    setProgress(null);
    setProblems(found);
    if (last) onChoose?.(last);
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload([...event.dataTransfer.files]);
        }}
        className={`mb-5 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center ${dragging ? "border-brand bg-brand-soft" : "border-line"}`}
      >
        <input
          ref={input}
          type="file"
          multiple
          accept={PICTURE_TYPES.join(",")}
          onChange={(event) => {
            void upload([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
          className="sr-only"
        />
        {full ? (
          <p className="text-ink-muted">
            You have uploaded the most pictures an account can hold.
          </p>
        ) : (
          <>
            <p className="font-semibold">
              {progress
                ? `Uploading ${progress.at} of ${progress.of}…`
                : "Drop pictures here"}
            </p>
            <button
              type="button"
              disabled={progress !== null}
              onClick={() => input.current?.click()}
              className="border-brand text-brand hover:bg-brand-soft min-h-11 rounded-lg border bg-white px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Choose pictures to upload
            </button>
            <p className="text-ink-muted text-sm">
              Several at a time. JPEG, PNG or WebP, up to 10 MB each.
            </p>
          </>
        )}
        <p className="text-ink-muted text-sm">
          {uploaded} of {PICTURES_MAX} uploads used
        </p>
      </div>

      {problems.length > 0 ? (
        <ul role="alert" className="text-bad mb-5 text-sm">
          {problems.map((each) => (
            <li key={each}>{each}</li>
          ))}
        </ul>
      ) : null}

      {pictures.length === 0 ? (
        <p className="text-ink-muted">No pictures yet.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3.5">
          {pictures.map((each) => {
            const words = (
              <>
                <img
                  src={each.url}
                  alt=""
                  loading="lazy"
                  className="h-28 w-full object-cover"
                />
                <span className="block px-3 py-2.5 text-left">
                  <span className="block truncate text-sm font-semibold">
                    {each.description || "No name"}
                  </span>
                  {used ? (
                    <span className="text-ink-muted block text-[13px]">
                      {used.has(each.id)
                        ? `Used on ${used.get(each.id)?.join(", ")}`
                        : "Not used yet"}
                    </span>
                  ) : null}
                </span>
              </>
            );
            return (
              <li key={each.id} className="relative">
                {onChoose ? (
                  <button
                    type="button"
                    aria-pressed={each.id === chosenId}
                    onClick={() => onChoose(each)}
                    className="border-line aria-pressed:border-brand aria-pressed:ring-brand-soft focus-visible:outline-brand block w-full cursor-pointer overflow-hidden rounded-xl border bg-white focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:ring-4"
                  >
                    {words}
                  </button>
                ) : (
                  <button
                    type="button"
                    title="See this picture larger"
                    onClick={() => setViewing(each)}
                    className="border-line focus-visible:outline-brand block w-full cursor-zoom-in overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {words}
                  </button>
                )}
                {onChoose ? (
                  <button
                    type="button"
                    onClick={() => setViewing(each)}
                    className="text-brand absolute top-2 right-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold shadow-sm hover:bg-white"
                  >
                    View
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {viewing ? (
        <PicturePreview picture={viewing} onClose={() => setViewing(null)} />
      ) : null}
    </div>
  );
}
