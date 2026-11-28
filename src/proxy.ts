import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { WAITLIST } from "@/lib/launch";

// In waitlist mode the grader and sign-up are closed: anyone who lands on them
// goes to the waitlist instead. /login and the dashboard stay for the team.
const CLOSED = ["/audit", "/results", "/signup"];

// Runs on every matched request: refreshes the Supabase session cookie and
// sends signed-out visitors away from the dashboard.
export async function proxy(request: NextRequest) {
  // Private preview: /preview?key=... sets a cookie that lets the holder past the waitlist.
  const key = process.env.PREVIEW_KEY;
  if (request.nextUrl.pathname === "/preview") {
    const url = request.nextUrl.clone();
    url.search = "";
    if (key && request.nextUrl.searchParams.get("key") === key) {
      url.pathname = "/audit";
      const res = NextResponse.redirect(url);
      res.cookies.set("2fish_preview", key, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
      return res;
    }
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  const previewing = Boolean(key) && request.cookies.get("2fish_preview")?.value === key;
  // The /demo test drive may use the grader and results, never sign-up.
  const demo = request.cookies.get("2fish_demo")?.value === "1";
  const demoOk = demo && ["/audit", "/results"].includes(request.nextUrl.pathname);

  if (WAITLIST && !previewing && !demoOk && CLOSED.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.hash = "waitlist";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Test drive: signed-out visitors with the demo cookie get the sample
  // dashboard. Pages under it show a note instead of a login wall.
  if (!user && demo && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    const sub = request.nextUrl.pathname.split("/")[2];
    url.pathname = "/demo/dashboard";
    if (sub) url.searchParams.set("soon", sub);
    return NextResponse.rewrite(url);
  }

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/preview", "/dashboard/:path*", "/audit", "/results", "/login", "/signup", "/auth/:path*"],
};
