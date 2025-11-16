import { useMemo, useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReportStatus = "Pendiente" | "En atención" | "Atendido";

interface ReportRow {
  id: string;
  name: string;
  location: string;
  status: ReportStatus;
  registeredAt: string;
}

const SAMPLE_REPORTS: ReportRow[] = [
  {
    id: "1",
    name: "Fallas con el proyector",
    location: "M801",
    status: "Pendiente",
    registeredAt: "10 noviembre 2025",
  },
  {
    id: "2",
    name: "Luces dañadas",
    location: "A101",
    status: "En atención",
    registeredAt: "5 octubre 2025",
  },
  {
    id: "3",
    name: "Incidente con mesas",
    location: "A203",
    status: "Atendido",
    registeredAt: "1 octubre 2025",
  },
  {
    id: "4",
    name: "Fallo eléctrico",
    location: "Laboratorio B12",
    status: "Pendiente",
    registeredAt: "4 octubre 2025",
  },
  {
    id: "5",
    name: "Puerta rota",
    location: "Pasadizo C",
    status: "En atención",
    registeredAt: "11 noviembre 2025",
  },
];

const statusLabels: Record<ReportStatus, string> = {
  Pendiente: "Pendiente",
  "En atención": "En Atención",
  Atendido: "Atendidos",
};

const ReportsDashboardPage = () => {
  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<ReportStatus[]>([
    "Pendiente",
    "En atención",
    "Atendido",
  ]);

  const toggleStatus = (status: ReportStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return SAMPLE_REPORTS.filter((report) => {
      const matchesStatus = activeStatuses.includes(report.status);
      const matchesSearch =
        !normalizedSearch ||
        report.name.toLowerCase().includes(normalizedSearch) ||
        report.location.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [search, activeStatuses]);

  return (
    <div className="min-h-screen bg-sky-400 px-4 ">
      <div className="container mx-auto flex h-screen  flex-col gap-6  bg-white p-8 shadow-2xl">
        <header className="space-y-1">
          <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
          <p className="text-xl text-slate-800">
            Bienvenido, <span className="font-semibold">{`{nombre}`}</span>
          </p>
          <p className="text-sm text-slate-500">
            Reportar incidentes dentro del campus UTEC
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(statusLabels) as ReportStatus[]).map((status) => {
            const label = statusLabels[status];
            const active = activeStatuses.includes(status);
            return (
              <button
                key={status}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow"
                    : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-white"
                }`}
                type="button"
                onClick={() => toggleStatus(status)}
              >
                {label}
              </button>
            );
          })}

          <div className="ml-auto">
            <Button
              className="rounded-full bg-yellow-400 px-6 py-5 text-slate-900 hover:bg-yellow-300"
              asChild
            >
              <Link to="/report">Crear Reporte</Link>
            </Button>
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <p className="text-lg font-semibold text-slate-800">
              Historial de reportes
            </p>
            <Input
              className="h-12 max-w-xs rounded-full border-slate-300 bg-white"
              placeholder="Buscar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="grid grid-cols-4 gap-2 border-b border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700">
              <span>Nombre de reporte</span>
              <span>Ubicación</span>
              <span>Estado</span>
              <span>Fecha registro</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="grid grid-cols-4 gap-2 px-6 py-4 text-sm text-slate-800"
                >
                  <span>{report.name}</span>
                  <span>{report.location}</span>
                  <span>{report.status}</span>
                  <span>{report.registeredAt}</span>
                </div>
              ))}
              {filteredReports.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-slate-500">
                  No se encontraron reportes que coincidan con los filtros.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
