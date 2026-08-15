"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Globe, FolderTree, Users, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const items = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/websites", label: "网站管理", icon: Globe },
  { href: "/admin/categories", label: "分类管理", icon: FolderTree },
  { href: "/admin/users", label: "用户管理", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await authClient.signOut();
    toast.success("已退出");
    router.push("/login");
  }

  return (
    <aside className="glass sticky top-0 flex h-screen w-56 flex-col gap-2 p-4">
      <div className="mb-4 px-2 text-xl font-bold tracking-tight">NavOS 后台</div>
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            pathname === href
              ? "bg-blue-600/10 text-blue-600 dark:text-blue-400"
              : "text-neutral-600 hover:bg-neutral-500/10"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
      <div className="mt-auto flex items-center justify-between px-2">
        <a href="/" className="text-xs text-neutral-500 hover:text-neutral-700">
          返回前台
        </a>
        <button onClick={logout} className="text-neutral-500 hover:text-red-500">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}