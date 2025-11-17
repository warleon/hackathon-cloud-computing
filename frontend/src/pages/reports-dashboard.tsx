import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { VirtualTable } from "@/components/data/virtual-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/hooks/auth/authContext";
import { ENDPOINTS } from "@/lib/constants";
import { type Incident } from "@/lib/incident_types";
import { cn } from "@/lib/utils";

const STATUS_TOGGLES = [
  { label: "Pendiente", value: "PENDING" },
  { label: "En Atención", value: "ATTENDING" },
  { label: "Atendidos", value: "FINISHED" },
];

const PAGE_SIZE = 25;

const STATUS_DISPLAY: Record<string, string> = {
  PENDING: "Pendiente",
  ATTENDING: "En atención",
  FINISHED: "Atendido",
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const ReportsDashboardPage = () => {
  const { user, request } = useAuthContext();
  const tenant = user?.tenant;
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>(
    STATUS_TOGGLES.map((status) => status.value)
  );

  const incidentsQuery = useInfiniteQuery({
    queryKey: [
      "incidents",
      tenant,
      { search, states: [...statusFilters].sort().join(",") },
    ],
    enabled: Boolean(tenant),
    initialPageParam: null as Record<string, unknown> | null,
    queryFn: async ({ pageParam }) => {
      const payload: Record<string, unknown> = {
        tenant,
        limit: PAGE_SIZE,
      };
      if (pageParam) payload.lastEvaluatedKey = pageParam;
      if (search.trim()) payload.search = search.trim();
      if (
        statusFilters.length &&
        statusFilters.length !== STATUS_TOGGLES.length
      ) {
        payload.states = statusFilters;
      }
      return request(ENDPOINTS.INCIDENT.LIST, payload);
    },
    getNextPageParam: (lastPage) => lastPage?.lastEvaluatedKey ?? undefined,
  });

  const incidents: Incident[] =
    incidentsQuery.data?.pages.flatMap((page) => page?.items ?? []) ?? [];

  const columns = useMemo<ColumnDef<Incident>[]>(() => {
    return [
      {
        header: "Nombre de reporte",
        accessorKey: "title",
        meta: { width: "2fr" },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.title}</span>
            <span className="text-xs text-slate-500">
              {row.original.creator}
            </span>
          </div>
        ),
      },
      {
        header: "Ubicación",
        accessorKey: "location",
        meta: { width: "1fr" },
      },
      {
        header: "Estado",
        accessorKey: "state",
        meta: { width: "1fr" },
        cell: ({ row }) =>
          STATUS_DISPLAY[row.original.state] ?? row.original.state,
      },
      {
        header: "Fecha registro",
        accessorKey: "createdAt",
        meta: { width: "1fr" },
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ];
  }, []);

  const table = useReactTable({
    data: incidents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleToggleStatus = (value: string) => {
    setStatusFilters((prev) => {
      if (prev.includes(value)) {
        const next = prev.filter((item) => item !== value);
        return next.length ? next : [];
      }
      return [...prev, value];
    });
  };

  const handleLoadMore = () => {
    if (!incidentsQuery.hasNextPage || incidentsQuery.isFetchingNextPage) {
      return;
    }
    incidentsQuery.fetchNextPage();
  };

  const isEmpty = !incidentsQuery.isLoading && incidents.length === 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[2.5rem] bg-white p-8 shadow-2xl">
      <header className="space-y-1">
        <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
        <p className="text-xl text-slate-800">
          Bienvenido,{" "}
          <span className="font-semibold">{user?.fullName || user?.email}</span>
        </p>
        <p className="text-sm text-slate-500">
          Reporta incidentes dentro del campus UTEC
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {STATUS_TOGGLES.map((toggle) => {
          const active = statusFilters.includes(toggle.value);
          return (
            <button
              key={toggle.value}
              className={cn(
                "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-slate-900 bg-slate-900 text-white shadow"
                  : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-white"
              )}
              type="button"
              onClick={() => handleToggleStatus(toggle.value)}
            >
              {toggle.label}
            </button>
          );
        })}

        <div className="ml-auto flex gap-3">
          <Input
            className="h-12 rounded-full border-slate-300 bg-white"
            placeholder="Buscar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button
            className="rounded-full bg-yellow-400 px-6 py-3 text-slate-900 hover:bg-yellow-300"
            asChild
          >
            <Link to="/report">Crear reporte</Link>
          </Button>
        </div>
      </div>

      {incidentsQuery.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          No se pudieron obtener los incidentes.
          <Button
            className="ml-3 h-8 rounded-full bg-red-600 px-3 text-xs text-white hover:bg-red-500"
            type="button"
            onClick={() => incidentsQuery.refetch()}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <section className="space-y-4">
          <p className="text-lg font-semibold text-slate-800">
            Historial de reportes
          </p>
          <VirtualTable
            table={table}
            hasMore={Boolean(incidentsQuery.hasNextPage)}
            onLoadMore={handleLoadMore}
            isFetching={
              incidentsQuery.isFetchingNextPage || incidentsQuery.isLoading
            }
            emptyState={
              isEmpty
                ? "No se encontraron reportes con esos filtros."
                : undefined
            }
          />
        </section>
      )}
    </div>
  );
};

export default ReportsDashboardPage;
