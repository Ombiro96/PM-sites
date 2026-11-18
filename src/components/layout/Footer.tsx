import { useSite } from "@/lib/site/context";
import type { SocialNetwork } from "@/lib/site/types";
import { safeUrl, telHref } from "@/lib/utils";

const NETWORKS: [SocialNetwork, string][] = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["x", "X"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
];

export function Footer() {
  const { facts, site, document } = useSite();
  const social = document.footer.show_social
    ? NETWORKS.flatMap(([key, label]) => {
        const href = safeUrl(facts.social_links[key]);
        return href ? [{ href, label }] : [];
      })
    : [];

  return (
    <footer className="ft">
      <div className="in">
        <div>
          <b>{facts.name}</b>
          {facts.office_address ? <span>{facts.office_address}</span> : null}
        </div>
        <div>
          {facts.phone ? (
            <a href={telHref(facts.phone)}>{facts.phone}</a>
          ) : null}
          {facts.email ? (
            <a href={`mailto:${facts.email}`}>{facts.email}</a>
          ) : null}
        </div>
        {social.length ? (
          <div>
            {social.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
        {site.show_credit ? (
          <div className="small">
            <a
              href="https://bomahut.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              Website by Bomahut
            </a>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
