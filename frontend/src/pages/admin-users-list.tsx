import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { VirtualTable } from "@/components/data/virtual-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENDPOINTS } from "@/lib/constants";
import { type User } from "@/lib/auth_types";
import { useAuthContext } from "@/hooks/auth/authContext";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  attendant: "Operador",
  reporter: "Reportador",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
};

const ROLE_FILTERS = [
  { label: "Todos los roles", value: "all" },
  { label: "Administrador", value: "admin" },
  { label: "Operador", value: "attendant" },
  { label: "Reportador", value: "reporter" },
];

const STATUS_FILTERS = [
  { label: "Todos los estados", value: "all" },
  { label: "Activo", value: "ACTIVE" },
  { label: "Suspendido", value: "SUSPENDED" },
];

const PAGE_SIZE = 25;

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const AdminUsersListPage = () => {
  const navigate = useNavigate();
  const { request, user } = useAuthContext();
  const tenant = user?.tenant;
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const usersQuery = useInfiniteQuery({
    queryKey: ["users", tenant, { search, roleFilter, statusFilter }],
    enabled: Boolean(tenant),
    initialPageParam: null as Record<string, unknown> | null,
    queryFn: async ({ pageParam }) => {
      const payload: Record<string, unknown> = {
        tenant,
        limit: PAGE_SIZE,
      };
      if (pageParam) payload.lastEvaluatedKey = pageParam;
      if (search.trim()) payload.search = search.trim();
      if (roleFilter !== "all") payload.role = roleFilter;
      if (statusFilter !== "all") payload.status = statusFilter;
      return request(ENDPOINTS.USER.LIST, payload);
    },
    getNextPageParam: (lastPage) => lastPage?.lastEvaluatedKey ?? undefined,
  });

  const items: User[] =
    usersQuery.data?.pages.flatMap((page) => page?.items ?? []) ?? [];

  const columns = useMemo<ColumnDef<User>[]>(() => {
    return [
      {
        header: "Nombre",
        accessorFn: (row) => row.fullName || row.email,
        meta: { width: "2fr" },
        cell: ({ row }) => {
          const fullName = row.original.fullName || "Sin nombre";
          return (
            <div className="flex flex-col">
              <span className="font-medium">{fullName}</span>
              <span className="text-xs text-slate-500">
                {row.original.email}
              </span>
            </div>
          );
        },
      },
      {
        header: "Rol",
        accessorFn: (row) => row.roles?.[0] ?? "-",
        meta: { width: "1fr" },
        cell: ({ row }) => {
          const roleKey = row.original.roles?.[0];
          return ROLE_LABELS[roleKey ?? ""] ?? "Sin rol";
        },
      },
      {
        header: "Estado",
        accessorKey: "status",
        meta: { width: "1fr" },
        cell: ({ row }) =>
          STATUS_LABELS[row.original.status ?? ""] ?? "Sin estado",
      },
      {
        header: "Última actualización",
        accessorKey: "updatedAt",
        meta: { width: "1fr" },
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
    ];
  }, []);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isEmpty = !usersQuery.isLoading && items.length === 0;

  const handleLoadMore = () => {
    if (usersQuery.isFetchingNextPage || !usersQuery.hasNextPage) return;
    usersQuery.fetchNextPage();
  };

  return (
    <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-white p-8 shadow-2xl">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div>
          <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
          <p className="text-xl font-medium text-slate-700">
            Gestión de usuarios
          </p>
          <p className="text-sm text-slate-500">
            Filtra por rol, estado o búsqueda para encontrar colaboradores.
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
            {ROLE_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-12 rounded-full border border-slate-200">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {usersQuery.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Ocurrió un error obteniendo los usuarios.
          <Button
            className="ml-4 h-8 rounded-full bg-red-600 text-xs hover:bg-red-500"
            type="button"
            onClick={() => usersQuery.refetch()}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <VirtualTable
          table={table}
          hasMore={Boolean(usersQuery.hasNextPage)}
          onLoadMore={handleLoadMore}
          isFetching={usersQuery.isFetchingNextPage || usersQuery.isLoading}
          emptyState={isEmpty ? "No hay usuarios con esos filtros." : undefined}
          onRowClick={(row) => navigate(`/admin/users/${row.original.id}/edit`)}
        />
      )}
    </div>
  );
};

export default AdminUsersListPage;
