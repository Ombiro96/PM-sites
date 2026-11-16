import type { ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/primitives";
import type { ResolvedButton } from "@/lib/site/actions";

export function ActionButton({
  button,
  ...props
}: { button: ResolvedButton } & Omit<
  ComponentProps<typeof ButtonLink>,
  "href" | "children"
>) {
  return (
    <ButtonLink
      href={button.href}
      target={button.external ? "_blank" : undefined}
      rel={button.external ? "noreferrer noopener" : undefined}
      {...props}
    >
      {button.label}
    </ButtonLink>
  );
}
