import type { Metadata } from "next";
import { LoginScreen } from "@/components/screens/login";

export const metadata: Metadata = { title: "Save your plan" };

// Same screen as sign-in, framed around saving the plan the owner just saw.
export default function SignupPage() {
  return <LoginScreen next="/dashboard" mode="save" />;
}
