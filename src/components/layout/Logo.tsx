import { useSite } from "@/lib/site/context";
import { initials, safeUrl } from "@/lib/utils";

/** The manager's logo beside the name; without a logo, the name's initials stand in for it. */
export function Logo() {
  const { facts } = useSite();
  const logo = safeUrl(facts.logo);
  return (
    <a className="logo" href="/" aria-label={`${facts.name}, home`}>
      {logo ? (
        <img src={logo} alt="" />
      ) : (
        <i aria-hidden="true">{initials(facts.name)}</i>
      )}
      <span>{facts.name}</span>
    </a>
  );
}
