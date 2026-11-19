import type { SiteDocument } from "@/lib/site/types";
import { PictureUpload } from "../../components/PictureUpload";
import { picturesUsed } from "../../lib/draft";
import { PICTURES_MAX, type Picture } from "../../lib/site";

export function PicturesView({
  pictures,
  document,
  onAdded,
}: {
  pictures: readonly Picture[];
  document: SiteDocument;
  onAdded: (picture: Picture) => void;
}) {
  const used = picturesUsed(document);
  const uploaded = pictures.filter((each) => each.source === "upload").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="border-line self-start rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Upload a picture</h2>
        <PictureUpload id="picture" pictures={pictures} onAdded={onAdded} />
      </div>

      <div>
        <p className="mb-3 font-semibold">
          {uploaded} of {PICTURES_MAX} uploads used
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
