import type { Metadata } from "next";
import { TextBackScreen } from "@/components/screens/text-back";

export const metadata: Metadata = { title: "Missed-call text-back" };

export default function TextBackPage() {
  return <TextBackScreen />;
}
