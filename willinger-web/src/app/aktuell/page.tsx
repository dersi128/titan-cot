import type { Metadata } from "next";
import { AktuellView } from "@/components/AktuellView";

export const metadata: Metadata = { title: "Aktuell" };

export default function AktuellPage() {
  return <AktuellView locale="de" />;
}
