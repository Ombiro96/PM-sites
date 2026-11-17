import type { Section } from "@/lib/site/types";
import { Contact, ManagementRequest, MessageForm } from "./contact";
import {
  About,
  Areas,
  CallToAction,
  Fees,
  Figures,
  Questions,
  Services,
  Steps,
  Team,
  Testimonials,
} from "./content";
import { Buildings, Houses } from "./Houses";
import { PageTitle } from "./PageTitle";
import { TopBanner } from "./TopBanner";

/**
 * Draws one stored section. A hidden section, a section with no fields, and a
 * type this version of the app does not know all draw nothing.
 */
export function SectionRenderer({ section }: { section: Section }) {
  if (!section || section.hidden || typeof section.fields !== "object" || section.fields === null) {
    return null;
  }

  switch (section.type) {
    case "page_title":
      return <PageTitle section={section} />;
    case "top_banner":
      return <TopBanner section={section} />;
    case "houses":
      return <Houses section={section} />;
    case "about":
      return <About section={section} />;
    case "services":
      return <Services section={section} />;
    case "steps":
      return <Steps section={section} />;
    case "figures":
      return <Figures section={section} />;
    case "buildings":
      return <Buildings section={section} />;
    case "team":
      return <Team section={section} />;
    case "testimonials":
      return <Testimonials section={section} />;
    case "areas":
      return <Areas section={section} />;
    case "questions":
      return <Questions section={section} />;
    case "fees":
      return <Fees section={section} />;
    case "management_request":
      return <ManagementRequest section={section} />;
    case "message_form":
      return <MessageForm section={section} />;
    case "contact":
      return <Contact section={section} />;
    case "call_to_action":
      return <CallToAction section={section} />;
    default:
      return null;
  }
}
