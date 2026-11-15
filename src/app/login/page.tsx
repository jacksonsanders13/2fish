import type { Metadata } from "next";
import { LoginScreen } from "@/components/screens/login";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return <LoginScreen next={next && next.startsWith("/") ? next : "/dashboard"} error={error} />;
}
