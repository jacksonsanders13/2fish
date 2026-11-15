import type { Metadata } from "next";
import { AuthScreen } from "@/components/screens/auth";

export const metadata: Metadata = { title: "Create your account" };

// Reached from the results page. Creating the account also saves the plan.
export default function SignupPage() {
  return <AuthScreen mode="signup" next="/dashboard" />;
}
