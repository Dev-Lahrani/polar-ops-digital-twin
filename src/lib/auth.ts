import { AuthUser, AuthRole } from "@/types";

const DEMO_USERS: (AuthUser & { password: string })[] = [
  { id: "1", name: "Station Commander", email: "commander@maitri.gov.in", password: "maitri2026", role: "admin", station: "maitri" },
  { id: "2", name: "Operations Engineer", email: "ops@bharati.gov.in", password: "bharati2026", role: "engineer", station: "bharati" },
  { id: "3", name: "Mission Viewer", email: "viewer@ncpor.gov.in", password: "viewer2026", role: "viewer", station: "maitri" },
];

export function authenticateUser(email: string, password: string): AuthUser | null {
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  const { password: _, ...authUser } = user;
  return authUser;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("polar_ops_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("polar_ops_user", JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("polar_ops_user");
}

export const ROLE_PERMISSIONS: Record<AuthRole, string[]> = {
  admin: ["read", "write", "simulate", "approve-resupply", "manage-crew", "export"],
  engineer: ["read", "write", "simulate"],
  viewer: ["read"],
};

export function hasPermission(role: AuthRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
