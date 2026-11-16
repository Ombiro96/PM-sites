import type { Metadata } from "next";
import { StoredPage } from "@/components/site/StoredPage";
import { storedPageMetadata } from "@/lib/site/metadata";

export function generateMetadata(): Promise<Metadata> {
  return storedPageMetadata("contact");
}

export default function ContactPage() {
  return <StoredPage kind="contact" />;
}
