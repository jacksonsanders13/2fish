import type { Metadata } from "next";
import { ResultsScreen } from "@/components/screens/results";

export const metadata: Metadata = { title: "Your store score" };

export default function ResultsPage() {
  return <ResultsScreen />;
}
