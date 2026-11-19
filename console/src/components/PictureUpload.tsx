import { useState, type FormEvent } from "react";
import {
  PICTURE_BYTES_MAX,
  PICTURE_TYPES,
  PICTURES_MAX,
  uploadPicture,
  type Picture,
} from "../lib/site";
import { FormError, SubmitButton, TextField } from "./fields";

const DESCRIPTION_MAX = 120;

/** Uploads one picture to the account, wherever a manager needs a new one. */
export function PictureUpload({
  id,
  pictures,
  onAdded,
}: {
  id: string;
  pictures: readonly Picture[];
  onAdded: (picture: Picture) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);
  const uploaded = pictures.filter((each) => each.source === "upload").length;

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
    if (description.trim() === "") {
      setProblem("Give the picture a title.");
      return;
    }
    setProblem("");
    setBusy(true);
    try {
      const result = await uploadPicture({
        file,
        description: description.trim(),
      });
      if (!result.ok) {
        setProblem(result.message);
        return;
      }
      setFile(null);
      setDescription("");
      setRound(round + 1);
      onAdded(result.picture);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  if (uploaded >= PICTURES_MAX)
    return (
      <p className="text-ink-muted">
        You have uploaded the most pictures an account can hold.
      </p>
    );

  return (
    <form onSubmit={submit} noValidate>
      <FormError message={problem} />
      <div className="mb-4">
        <label
          htmlFor={`${id}-file`}
          className="mb-1.5 block text-sm font-medium"
        >
          Picture
        </label>
        <input
          key={round}
          id={`${id}-file`}
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
        id={`${id}-description`}
        label="Picture Title"
        hint="A few words, such as: Front of Sunrise Court."
        maxLength={DESCRIPTION_MAX}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <SubmitButton busy={busy}>Upload</SubmitButton>
    </form>
  );
}
