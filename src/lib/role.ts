export type Role = "admin" | "member";

export function roleForFirstUser(total: number): Role {
  return total === 0 ? "admin" : "member";
}