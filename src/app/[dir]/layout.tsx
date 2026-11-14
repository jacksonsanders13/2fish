import { dirParams, getDir } from "@/lib/dir";

export const dynamicParams = false;

export function generateStaticParams() {
  return dirParams();
}

export default async function DirLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dir: string }>;
}) {
  const dir = await getDir(params);
  return (
    <div data-dir={dir} className="min-h-dvh bg-white font-body text-ink">
      {children}
    </div>
  );
}
