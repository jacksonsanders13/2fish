import type { Metadata } from "next";
import { ResultsScreen } from "@/components/screens/results";
import { getDir } from "@/lib/dir";

export const metadata: Metadata = { title: "Your results" };

type Props = { params: Promise<{ dir: string }> };

export default async function ResultsPage({ params }: Props) {
  const dir = await getDir(params);
  return <ResultsScreen dir={dir} />;
}
