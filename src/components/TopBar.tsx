"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { useBoard } from "./BoardProvider";

export default function TopBar() {
  const { q, setQ, setDraftCategory } = useBoard();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-brand text-brand-ink shadow-[0_1px_0_rgba(0,0,0,.08)]">
      <div className="mx-auto flex max-w-[680px] items-center gap-2.5 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2 text-inherit no-underline" aria-label="2fish home">
          <span className="grid size-[38px] flex-none place-items-center rounded-[10px] bg-white">
            <Logo size={32} />
          </span>
          <b className="text-2xl font-black tracking-tight">2fish</b>
        </Link>

        <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white/20 px-3 py-[7px] max-[420px]:hidden">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search needs"
            autoComplete="off"
            aria-label="Search needs"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (pathname !== "/") router.push("/");
            }}
            className="w-full border-0 bg-transparent text-white outline-none placeholder:text-white/80"
          />
        </label>

        <Link
          href="/post"
          onClick={() => setDraftCategory(null)}
          className="ml-auto whitespace-nowrap rounded-full bg-white px-3.5 py-2 font-extrabold text-brand no-underline"
        >
          + Post
        </Link>
      </div>
    </header>
  );
}
