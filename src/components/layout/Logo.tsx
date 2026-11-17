import { useSite } from "@/lib/site/context";
import { initials, safeUrl } from "@/lib/utils";

/** The manager's logo, shown whole; without one, the name as a wordmark. */
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
      {logo ? null : <span>{facts.name}</span>}
    </a>
  );
}
