"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeRole } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export function UsersClient({ users }: { users: UserRow[] }) {
  const router = useRouter();

  async function updateRole(id: string, role: string) {
    try {
      await changeRole(id, role);
      toast.success("角色已更新");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">用户管理</h1>
      <div className="glass overflow-hidden rounded-3xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>角色</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-neutral-500">{u.email}</div>
                </TableCell>
                <TableCell>
                  <Select value={u.role ?? "member"} onValueChange={(v) => void updateRole(u.id, v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <Badge variant="default">管理员</Badge>
                      </SelectItem>
                      <SelectItem value="member">成员</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}