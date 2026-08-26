import type { Metadata } from "next";
import { SortimentView } from "@/components/SortimentView";

export const metadata: Metadata = { title: "Sortiment" };

export default function SortimentPage() {
  return <SortimentView locale="de" />;
}
