import { useState } from "react";
import { ActionLink } from "@/components/ui";
import { headerContactButton } from "@/lib/site/actions";
import { useActionContext, useSite } from "@/lib/site/context";
import { navItems, TENANT_LOGIN_URL } from "@/lib/site/pages";
import { cx } from "@/lib/utils";
import { Logo } from "./Logo";

export function Header({ pathname, over }: { pathname: string; over: boolean }) {
  const site = useSite();
  const context = useActionContext();
  // Remembers which address the menu was opened on, so it closes by itself after a link is followed.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const nav = navItems(site.document, site.site.look);
  const contact = headerContactButton(context);
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const links = nav.map((item) => (
    <a key={item.href} href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined}>
      {item.label}
    </a>
  ));
  const tenantLogin = site.document.header.show_tenant_login ? (
    <a className="tl" href={TENANT_LOGIN_URL} target="_blank" rel="noreferrer noopener">
      Tenant login
    </a>
  ) : null;
  const contactButton = (
    <ActionLink button={contact} className={cx("sm", contact?.kind === "whatsapp" && "wa")} />
  );

  return (
    <header className={cx("hd", over && "over", open && "open")}>
      <div className="in">
        <Logo />
        <nav className="nav" aria-label="Site">
          {links}
        </nav>
        <div className="hd-actions">
          {tenantLogin}
          {contactButton}
        </div>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav className="menu" id="site-menu" aria-label="Site menu">
          {links}
          <div className="row">
            {tenantLogin}
            {contactButton}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
