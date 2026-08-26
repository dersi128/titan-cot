import type { Metadata } from "next";
import { DatenschutzView } from "@/components/DatenschutzView";

export const metadata: Metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return <DatenschutzView locale="de" />;
}
