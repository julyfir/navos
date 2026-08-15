import { getDb } from "@/lib/db";
import { dashboardStats } from "@/lib/data/stats";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const stats = await dashboardStats(getDb(), admin.id);
  const cards = [
    { label: "网站", value: stats.websites },
    { label: "分类", value: stats.categories },
    { label: "今日访问", value: stats.todayVisits },
  ];
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">仪表盘</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-3xl p-6">
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="mt-1 text-sm text-neutral-500">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}