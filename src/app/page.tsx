import { getSessionUser } from "@/lib/session";
import { siteData } from "@/lib/data/compose";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const data = await siteData(user?.id ?? null);
  return (
    <HomeClient
      isLoggedIn={!!user}
      initCatgs={data.categories.map((c) => ({ id: c.id, name: c.name }))}
      initWebsites={data.websites}
    />
  );
}