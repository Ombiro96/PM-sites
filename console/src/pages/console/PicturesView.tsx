import type { SiteDocument } from "@/lib/site/types";
import { PictureLibrary } from "../../components/PictureLibrary";
import { picturesUsed } from "../../lib/draft";
import type { Picture } from "../../lib/site";

export function PicturesView({
  pictures,
  document,
  onAdded,
  onRemoved,
}: {
  pictures: readonly Picture[];
  document: SiteDocument;
  onAdded: (picture: Picture) => void;
  onRemoved: (picture: Picture) => void;
}) {
  return (
    <div className="border-line rounded-xl border bg-white p-5">
      <PictureLibrary
        pictures={pictures}
        used={picturesUsed(document)}
        onAdded={onAdded}
        onRemoved={onRemoved}
      />
      <p className="text-ink-muted mt-5 text-sm">
        Choose a picture for a section under Edit pages. Use the × on a picture
        you uploaded to delete it.
      </p>
    </div>
  );
}
