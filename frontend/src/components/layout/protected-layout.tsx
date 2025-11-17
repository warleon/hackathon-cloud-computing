import { type ReactElement } from "react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/hooks/auth/authContext";
import { type Role } from "@/lib/auth_types";
import { cn } from "@/lib/utils";

type RoleGuardProps = {
  roles: Role[];
  children: ReactElement;
};

const NAV_LINKS: { to: string; label: string; roles?: Role[] }[] = [
  {
    to: "/reports",
    label: "Historial",
    roles: ["reporter", "attendant", "admin"],
  },
  {
    to: "/report",
    label: "Nuevo reporte",
    roles: ["reporter", "attendant", "admin"],
  },
  {
    to: "/admin/users",
    label: "Usuarios",
    roles: ["admin"],
  },
  {
    to: "/admin/users/create",
    label: "Crear usuario",
    roles: ["admin"],
  },
];

const AppNavbar = () => {
  const { user, logout } = useAuthContext();
  const userRoles = user?.roles ?? [];
  const links = NAV_LINKS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => userRoles.includes(role));
  });

  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
        <Link className="text-xl font-semibold text-slate-900" to="/reports">
          ALERTA UTEC
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100",
                  {
                    "bg-slate-900 text-white hover:bg-slate-900": isActive,
                  }
                )
              }
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-slate-600 sm:block">
            {user?.fullName || user?.email}
          </p>
          <Button
            className="rounded-full bg-slate-900 hover:bg-slate-800"
            size="sm"
            type="button"
            onClick={logout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
};

export const ProtectedLayout = () => {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <main className="flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const { isAuthenticated, user } = useAuthContext();
  if (!isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  const hasRole = roles.some((role) => user?.roles?.includes(role));
  if (!hasRole) {
    return <Navigate replace to="/reports" />;
  }

  return children;
};
