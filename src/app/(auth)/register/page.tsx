"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "注册失败");
      return;
    }
    toast.success("注册成功，已自动登录");
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">创建账号</h1>
        <p className="mt-1 text-sm text-neutral-500">第一个账号将自动成为管理员</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">昵称</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="NavOS 用户" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 8 位" />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={loading}>
        {loading ? "注册中…" : "注册"}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        已有账号？<Link href="/login" className="underline decoration-blue-600 hover:underline">登录</Link>
      </p>
    </form>
  );
}