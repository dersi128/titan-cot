import type { Metadata } from "next";
import { ImpressumView } from "@/components/ImpressumView";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return <ImpressumView locale="de" />;
}
