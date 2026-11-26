import { useSite } from "@/lib/site/context";
import { navItems, TENANT_LOGIN_URL } from "@/lib/site/pages";
import type { SocialNetwork } from "@/lib/site/types";
import { safeUrl, telHref, whatsappHref } from "@/lib/utils";

const NETWORKS: [SocialNetwork, string][] = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["x", "X"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
];

const WHATSAPP_LOGO =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

const OUTSIDE = { target: "_blank", rel: "noreferrer noopener" };

export function Footer() {
  const { facts, site, document } = useSite();
  const pages = navItems(document, site.look);
  const social = document.footer.show_social
    ? NETWORKS.flatMap(([key, label]) => {
        const href = safeUrl(facts.social_links[key]);
        return href ? [{ href, label }] : [];
      })
    : [];
  const hasContact = Boolean(facts.phone || facts.whatsapp || facts.email);
  const logo = safeUrl(facts.logo);

  return (
    <footer className="ft">
      <div className="in">
        <div className="ft-cols">
          <div className="ft-about">
            <b>{facts.name}</b>
            {logo ? <img className="ft-logo" src={logo} alt="" /> : null}
            {facts.office_address ? <p>{facts.office_address}</p> : null}
            {facts.opening_hours ? <p>{facts.opening_hours}</p> : null}
          </div>
          <nav aria-labelledby="ft-pages">
            <p className="ft-h" id="ft-pages">
              Pages
            </p>
            {pages.map((page) => (
              <a key={page.href} href={page.href}>
                {page.label}
              </a>
            ))}
            {document.header.show_tenant_login ? (
              <a href={TENANT_LOGIN_URL} {...OUTSIDE}>
                Tenant login
              </a>
            ) : null}
          </nav>
          {hasContact ? (
            <div>
              <p className="ft-h">Contact</p>
              {facts.phone ? (
                <a href={telHref(facts.phone)}>{facts.phone}</a>
              ) : null}
              {facts.whatsapp ? (
                <a
                  className="ft-wa"
                  href={whatsappHref(facts.whatsapp)}
                  {...OUTSIDE}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={WHATSAPP_LOGO} />
                  </svg>
                  WhatsApp
                </a>
              ) : null}
              {facts.email ? (
                <a href={`mailto:${facts.email}`}>{facts.email}</a>
              ) : null}
            </div>
          ) : null}
          {social.length > 0 ? (
            <div>
              <p className="ft-h">Follow us</p>
              {social.map((link) => (
                <a key={link.label} href={link.href} {...OUTSIDE}>
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="ft-base">
          <span>
            © {new Date().getFullYear()} {facts.name}
          </span>
          {site.show_credit ? (
            <a href="https://bomahut.com" {...OUTSIDE}>
              Website by Bomahut
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
