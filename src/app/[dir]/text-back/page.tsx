import type { Metadata } from "next";
import { TextBackScreen } from "@/components/screens/text-back";
import { getDir } from "@/lib/dir";

export const metadata: Metadata = { title: "Missed-call text-back" };

type Props = { params: Promise<{ dir: string }> };

export default async function TextBackPage({ params }: Props) {
  const dir = await getDir(params);
  return <TextBackScreen dir={dir} />;
}
