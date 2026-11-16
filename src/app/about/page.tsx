import type { Metadata } from "next";
import { StoredPage } from "@/components/site/StoredPage";
import { storedPageMetadata } from "@/lib/site/metadata";

export function generateMetadata(): Promise<Metadata> {
  return storedPageMetadata("about");
}

export default function AboutPage() {
  return <StoredPage kind="about" />;
}
