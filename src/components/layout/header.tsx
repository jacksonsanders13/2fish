import { getHeaderUser } from "@/lib/auth/server";
import { SiteHeader } from "./site-header";

// Server wrapper: looks up who's signed in, hands it to the client header.
export async function Header({ right }: { right?: React.ReactNode }) {
  const user = await getHeaderUser();
  return <SiteHeader user={user} right={right} />;
}
