import { HOUSES_PATH, houseWords } from "@/lib/site/pages";
import { useSite } from "@/lib/site/context";

export function NotFoundPage() {
  const words = houseWords(useSite().site.look);
  return (
    <section className="sec pagehd">
      <div className="in">
        <div className="headg">
          <span className="eyebrow">Page not found</span>
          <h1 className="ltitle">We could not find that page</h1>
        </div>
        <p className="lead">The address may be old or mistyped.</p>
        <div className="row">
          <a className="btn" href="/">
            Go to the home page
          </a>
          <a className="btn line" href={HOUSES_PATH}>
            See {words.many} to let
          </a>
        </div>
      </div>
    </section>
  );
}
