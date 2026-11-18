import { useState, type FormEvent } from "react";
import type { SiteDocument } from "@/lib/site/types";
import { FormError, SubmitButton, TextField } from "../../components/fields";
import { picturesUsed } from "../../lib/draft";
import {
  PICTURE_BYTES_MAX,
  PICTURE_TYPES,
  PICTURES_MAX,
  uploadPicture,
  type Picture,
} from "../../lib/site";

const DESCRIPTION_MAX = 120;

export function PicturesView({
  pictures,
  document,
  onAdded,
}: {
  pictures: readonly Picture[];
  document: SiteDocument;
  onAdded: (picture: Picture) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);
  const used = picturesUsed(document);
  const full = pictures.length >= PICTURES_MAX;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setProblem("Choose a picture to upload.");
      return;
    }
    if (!PICTURE_TYPES.includes(file.type) || file.size > PICTURE_BYTES_MAX) {
      setProblem("Upload a JPEG, PNG or WebP picture of up to 10 MB.");
      return;
    }
    setProblem("");
    setBusy(true);
    try {
      const result = await uploadPicture({ file, description });
      if (!result.ok) {
        setProblem(result.message);
        return;
      }
      onAdded(result.picture);
      setFile(null);
      setDescription("");
      setRound(round + 1);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <form
        onSubmit={submit}
        noValidate
        className="border-line self-start rounded-xl border bg-white p-5"
      >
        <h2 className="mb-3 text-lg font-semibold">Upload a picture</h2>
        <FormError message={problem} />
        {full ? (
          <p className="text-ink-muted">
            You have the most pictures a website can hold.
          </p>
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="picture-file"
                className="mb-1.5 block text-sm font-medium"
              >
                Picture
              </label>
              <input
                key={round}
                id="picture-file"
                type="file"
                accept={PICTURE_TYPES.join(",")}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="border-line file:bg-brand-soft file:text-brand w-full rounded-lg border bg-white p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:font-semibold"
              />
              <p className="text-ink-muted mt-1.5 text-sm">
                JPEG, PNG or WebP, up to 10 MB.
              </p>
            </div>
            <TextField
              id="picture-description"
              label="What it shows"
              hint="A few words, such as: Front of Sunrise Court."
              maxLength={DESCRIPTION_MAX}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <SubmitButton busy={busy}>Upload</SubmitButton>
          </>
        )}
      </form>

      <div>
        <p className="mb-3 font-semibold">
          {pictures.length} of {PICTURES_MAX} pictures
        </p>
        {pictures.length === 0 ? (
          <p className="text-ink-muted">
            No pictures yet. Upload one, then choose it in a section under Edit
            pages.
          </p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3.5">
            {pictures.map((each) => (
              <li
                key={each.id}
                className="border-line overflow-hidden rounded-xl border bg-white"
              >
                <img
                  src={each.url}
                  alt={each.description}
                  loading="lazy"
                  className="h-28 w-full object-cover"
                />
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold">
                    {each.description || "No description"}
                  </p>
                  <p className="text-ink-muted text-[13px]">
                    {used.has(each.id)
                      ? `Used on ${used.get(each.id)?.join(", ")}`
                      : "Not used yet"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-ink-muted mt-4 text-sm">
          Deleting a picture is not part of this first version.
        </p>
      </div>
    </div>
  );
}
