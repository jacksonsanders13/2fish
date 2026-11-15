import type { Metadata } from "next";
import { AuthScreen } from "@/components/screens/auth";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return <AuthScreen mode="signin" next={next && next.startsWith("/") ? next : "/dashboard"} error={error} />;
}
