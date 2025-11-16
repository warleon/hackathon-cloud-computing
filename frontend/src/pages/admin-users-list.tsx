import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "Administrador" | "Operador" | "Supervisor" | "Invitado";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Activo" | "Suspendido";
}

const USERS: UserRow[] = [
  {
    id: "u1",
    name: "Mariana Torres",
    email: "mariana@utec.edu.pe",
    role: "Administrador",
    status: "Activo",
  },
  {
    id: "u2",
    name: "Carlos Díaz",
    email: "cdiaz@utec.edu.pe",
    role: "Operador",
    status: "Activo",
  },
  {
    id: "u3",
    name: "Lucía Rivas",
    email: "lrivas@utec.edu.pe",
    role: "Supervisor",
    status: "Suspendido",
  },
  {
    id: "u4",
    name: "Bruno Medina",
    email: "bmedina@utec.edu.pe",
    role: "Operador",
    status: "Activo",
  },
];

const AdminUsersListPage = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return USERS.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);
      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ? true : user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-sky-400 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
            <p className="text-xl font-medium text-slate-700">
              Gestión de usuarios
            </p>
            <p className="text-sm text-slate-500">
              Filtra por rol o estado para ubicar rápidamente a tus colaboradores.
            </p>
          </div>
          <div className="ml-auto flex gap-3">
            <Button
              asChild
              className="rounded-full border border-slate-300 bg-white px-6 py-5 text-slate-700 hover:bg-slate-50"
            >
              <Link to="/admin/users/create">Nuevo usuario</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-slate-900 px-6 py-5 hover:bg-slate-800"
            >
              <Link to="/reports">Ver reportes</Link>
            </Button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Input
            className="h-12 rounded-full border border-slate-200"
            placeholder="Buscar por nombre o correo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-12 rounded-full border border-slate-200">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Operador">Operador</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Invitado">Invitado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 rounded-full border border-slate-200">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 border-b border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700">
            <span>Nombre</span>
            <span>Correo</span>
            <span>Rol</span>
            <span>Estado</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 px-6 py-4 text-sm text-slate-800 transition hover:bg-slate-50"
                to={`/admin/users/${user.id}/edit`}
              >
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span>{user.role}</span>
                <span>{user.status}</span>
              </Link>
            ))}
            {filteredUsers.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                No hay usuarios con esos filtros.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersListPage;
