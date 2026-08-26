import type { Metadata } from "next";
import { KontaktView } from "@/components/KontaktView";

export const metadata: Metadata = { title: "Kontakt" };

export default function KontaktPage() {
  return <KontaktView locale="de" />;
}
