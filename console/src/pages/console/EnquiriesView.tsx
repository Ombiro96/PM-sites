import { useEffect, useState } from "react";
import { Button } from "../../components/fields";
import { WHO_LABELS } from "../../lib/labels";
import { LEADS_PER_PAGE, readLeads, type LeadPage } from "../../lib/site";
import { formatDate } from "./GoLiveView";

const HEADINGS = [
  "Date",
  "Name",
  "Phone",
  "Who they are",
  "Building",
  "Message",
];
const CELL = "border-line border-b px-4 py-3 align-top";

export function EnquiriesView() {
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<LeadPage>();
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let active = true;
    readLeads({ offset, limit: LEADS_PER_PAGE })
      .then((found) => {
        if (!active) return;
        setPage(found);
        setProblem("");
      })
      .catch((error: unknown) => {
        if (active)
          setProblem(error instanceof Error ? error.message : String(error));
      });
    return () => {
      active = false;
    };
  }, [offset]);

  if (problem) return <p className="text-bad">{problem}</p>;
  if (!page) return <p className="text-ink-muted">Loading…</p>;
  if (page.totalCount === 0)
    return (
      <p className="border-line max-w-xl rounded-xl border bg-white p-5">
        Nobody has written to you through your website yet. Messages and
        requests to manage a building will appear here.
      </p>
    );

  const last = Math.min(offset + page.leads.length, page.totalCount);

  return (
    <>
      <div className="border-line overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[48rem] border-collapse text-[15px]">
          <thead>
            <tr className="text-ink-muted text-left text-[13px]">
              {HEADINGS.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="border-line border-b px-4 py-3 font-semibold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.leads.map((lead) => (
              <tr key={lead.id}>
                <td className={`${CELL} whitespace-nowrap`}>
                  {formatDate(lead.createdAt)}
                </td>
                <td className={`${CELL} font-semibold`}>{lead.name}</td>
                <td className={`${CELL} whitespace-nowrap`}>
                  <a href={`tel:${lead.phone.replaceAll(" ", "")}`}>
                    {lead.phone}
                  </a>
                </td>
                <td className={CELL}>{WHO_LABELS[lead.who] ?? ""}</td>
                <td className={CELL}>
                  {[
                    lead.buildingLocation,
                    lead.unitCount !== null ? `${lead.unitCount} units` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </td>
                <td className={`${CELL} text-ink-muted`}>{lead.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-muted text-sm">
          Showing {offset + 1} to {last} of {page.totalCount}, newest first.
          Enquiries about one house stay with that advert in the Bomahut
          dashboard.
        </p>
        {page.totalCount > LEADS_PER_PAGE ? (
          <div className="flex gap-2">
            <Button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(offset - LEADS_PER_PAGE, 0))}
            >
              Newer
            </Button>
            <Button
              disabled={last >= page.totalCount}
              onClick={() => setOffset(offset + LEADS_PER_PAGE)}
            >
              Older
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}
