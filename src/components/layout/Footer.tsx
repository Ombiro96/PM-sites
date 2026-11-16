import { Container } from "@/components/ui/primitives";
import type { CompanyFacts, SocialNetwork } from "@/lib/site/types";
import { telHref } from "@/lib/utils";

const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export function Footer({
  facts,
  showSocial,
  showCredit,
  reportUrl,
}: {
  facts: CompanyFacts;
  showSocial: boolean;
  showCredit: boolean;
  reportUrl: string | null;
}) {
  const social = showSocial
    ? (Object.entries(facts.social_links) as [SocialNetwork, string][])
    : [];

  return (
    <footer className="bg-footer text-[14.5px] text-footer-ink">
      <Container className="flex flex-wrap justify-between gap-x-10 gap-y-6 py-9">
        <div>
          <p className="font-display text-[17px] font-semibold text-white">
            {facts.display_name}
          </p>
          {facts.office_address ? (
            <address className="mt-1 not-italic">{facts.office_address}</address>
          ) : null}
        </div>

        <div>
          <p>
            <a href={telHref(facts.phone)} className="hover:text-white">
              {facts.phone}
            </a>
          </p>
          {facts.email ? (
            <p>
              <a href={`mailto:${facts.email}`} className="hover:text-white">
                {facts.email}
              </a>
            </p>
          ) : null}
          {social.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-4">
              {social.map(([network, href]) => (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-white"
                  >
                    {SOCIAL_LABELS[network]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          {showCredit ? (
            <p>
              <a
                href="https://www.bomahut.com"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-white"
              >
                Website by Bomahut
              </a>
            </p>
          ) : null}
          {reportUrl ? (
            <p>
              <a
                href={reportUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-white"
              >
                Report this site
              </a>
            </p>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
