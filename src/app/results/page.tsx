import type { Metadata } from "next";
import { ResultsScreen } from "@/components/screens/results";

export const metadata: Metadata = { title: "Your results" };

export default function ResultsPage() {
  return <ResultsScreen />;
}
