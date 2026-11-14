import { LandingA } from "@/components/landing/landing-a";
import { LandingB } from "@/components/landing/landing-b";
import { getDir } from "@/lib/dir";

type Props = { params: Promise<{ dir: string }> };

export default async function LandingPage({ params }: Props) {
  const dir = await getDir(params);
  return dir === "a" ? <LandingA dir={dir} /> : <LandingB dir={dir} />;
}
