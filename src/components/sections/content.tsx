import { ActionLink, Eyebrow, Picture, SectionShell } from "@/components/ui";
import { useListings } from "@/lib/listings/context";
import { resolveButton, useActionContext, useSite } from "@/lib/site/context";
import { houseWords } from "@/lib/site/pages";
import { resolvePicture } from "@/lib/site/pictures";
import type {
  AboutSection,
  AreasSection,
  CallToActionSection,
  FeesSection,
  Figure,
  FiguresSection,
  QuestionsSection,
  ServicesSection,
  StepsSection,
  TeamSection,
  TestimonialsSection,
} from "@/lib/site/types";
import { cx, initials, paragraphs } from "@/lib/utils";

function itemsOf<Item>(section: { items?: Item[] }): Item[] {
  return Array.isArray(section.items) ? section.items : [];
}

export function About({ section }: { section: AboutSection }) {
  const { pictures } = useSite();
  const picture = resolvePicture(section.fields.picture, pictures);
  const words = (
    <>
      <Eyebrow type="about" />
      <h2>{section.fields.heading}</h2>
      <div className="story">
        {paragraphs(section.fields.text).map((paragraph, index) => (
          <p className="lead" key={index}>
            {paragraph}
          </p>
        ))}
      </div>
    </>
  );
  return (
    <SectionShell section={section} ownHeading>
      {picture ? (
        <div className={cx("two", section.layout === "picture_right" && "flip")}>
          <Picture picture={picture} />
          <div>{words}</div>
        </div>
      ) : (
        <div className="one">{words}</div>
      )}
    </SectionShell>
  );
}

export function Services({ section }: { section: ServicesSection }) {
  const { wording } = useSite();
  const services = itemsOf(section).flatMap((item) => {
    // A standard service takes Bomahut's wording; a custom one is the manager's own.
    const standard = item.service ? wording.services[item.service] : undefined;
    const title = standard?.title ?? item.title;
    return title ? [{ id: item.id, title, text: standard?.text ?? item.text }] : [];
  });
  if (services.length === 0) return null;
  return (
    <SectionShell section={section}>
      {section.layout === "list" ? (
        <ul className="svc-list">
          {services.map((service) => (
            <li key={service.id}>
              {service.title}
              {service.text ? <span>{service.text}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="three svc-cards">
          {services.map((service) => (
            <div key={service.id}>
              <h3>{service.title}</h3>
              {service.text ? <p className="meta">{service.text}</p> : null}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

export function Steps({ section }: { section: StepsSection }) {
  const steps = itemsOf(section).filter((step) => step.title);
  if (steps.length === 0) return null;
  return (
    <SectionShell section={section}>
      <div className="three">
        {steps.map((step, index) => (
          <div key={step.id}>
            <span className="stepn">{index + 1}</span>
            <h3>{step.title}</h3>
            {step.text ? <p className="meta">{step.text}</p> : null}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

const FIGURE_NAMES: Record<Exclude<Figure, "houses_to_let">, [string, string]> = {
  buildings: ["building", "buildings"],
  units: ["unit", "units"],
  towns: ["town", "towns"],
};

/** Counts from Bomahut. A count of zero is left out, and with fewer than two left the section is not drawn. */
export function Figures({ section }: { section: FiguresSection }) {
  const { figures, site } = useSite();
  const listings = useListings();
  const words = houseWords(site.look);
  const shown = Array.isArray(section.fields.show) ? section.fields.show : [];

  const counts = shown.flatMap((figure): { figure: Figure; value: number; label: string }[] => {
    if (figure === "houses_to_let") {
      if (listings.status !== "ready" || listings.count === 0) return [];
      return [{ figure, value: listings.count, label: `${listings.count === 1 ? words.one : words.many} to let` }];
    }
    const names = FIGURE_NAMES[figure];
    const value = names ? figures[figure] : 0;
    return value > 0 ? [{ figure, value, label: value === 1 ? names[0] : names[1] }] : [];
  });
  if (counts.length < 2) return null;

  return (
    <SectionShell section={section}>
      <div className="fig">
        {counts.map((count) => (
          <div key={count.figure}>
            <b>{count.value.toLocaleString("en-KE")}</b>
            {count.label}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function Team({ section }: { section: TeamSection }) {
  const { pictures } = useSite();
  const people = itemsOf(section).filter((person) => person.name);
  if (people.length === 0) return null;
  return (
    <SectionShell section={section}>
      <div className="three">
        {people.map((person) => {
          const picture = resolvePicture(person.picture, pictures);
          return (
            <div className="who" key={person.id}>
              {picture ? <Picture picture={picture} /> : <i aria-hidden="true">{initials(person.name ?? "")}</i>}
              <span>
                <b>{person.name}</b>
                {person.role ? (
                  <>
                    <br />
                    <span className="meta">{person.role}</span>
                  </>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function Testimonials({ section }: { section: TestimonialsSection }) {
  // A quote is only ever shown when the manager confirmed they may publish it.
  const quotes = itemsOf(section).filter((item) => item.quote && item.permission === true);
  if (quotes.length === 0) return null;
  const single = section.layout === "single" || quotes.length === 1;
  return (
    <SectionShell section={section}>
      {single ? (
        <figure className="quote big">
          <p>“{quotes[0].quote}”</p>
          <figcaption className="meta">{quotes[0].by}</figcaption>
        </figure>
      ) : (
        <div className="three">
          {quotes.map((item) => (
            <figure className="quote" key={item.id}>
              <p>“{item.quote}”</p>
              <figcaption className="meta">{item.by}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

export function Areas({ section }: { section: AreasSection }) {
  const areas = useSite().facts.areas_served;
  if (areas.length < 2) return null;
  return (
    <SectionShell section={section}>
      <ul className="areas">
        {areas.map((area) => (
          <li key={area}>{area}</li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function Questions({ section }: { section: QuestionsSection }) {
  const questions = itemsOf(section).filter((item) => item.question && item.answer);
  if (questions.length === 0) return null;
  return (
    <SectionShell section={section}>
      <div className="faq">
        {questions.map((item, index) => (
          <details key={item.id} open={index === 0}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

export function Fees({ section }: { section: FeesSection }) {
  const fees = itemsOf(section).filter((fee) => fee.label && fee.value);
  if (fees.length === 0) return null;
  return (
    <SectionShell section={section}>
      <dl className="costd feesd">
        {fees.map((fee) => (
          <div key={fee.id} style={{ display: "contents" }}>
            <dt>{fee.label}</dt>
            <dd>{fee.value}</dd>
          </div>
        ))}
      </dl>
      {section.fields.note ? <p className="meta">{section.fields.note}</p> : null}
    </SectionShell>
  );
}

/** One line and a button on the brand colour, with an optional picture beside it. */
export function CallToAction({ section }: { section: CallToActionSection }) {
  const { pictures } = useSite();
  const context = useActionContext();
  const { fields } = section;
  const picture = resolvePicture(fields.picture, pictures);
  return (
    <section id={section.id} className="sec">
      <div className="in">
        <div className={cx("ctab", !picture && "bare")}>
          <div>
            <h2>{fields.heading}</h2>
            {fields.text ? <p className="lead">{fields.text}</p> : null}
            <ActionLink button={resolveButton(fields.button, context)} />
          </div>
          {picture ? <Picture picture={picture} /> : null}
        </div>
      </div>
    </section>
  );
}
