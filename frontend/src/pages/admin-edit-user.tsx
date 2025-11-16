import { type FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/hooks/auth/AuthProvider";
import { ENDPOINTS } from "@/lib/constants";
import { type User } from "@/lib/auth_types";

const ROLE_OPTIONS = [
  { label: "Administrador", value: "admin" },
  { label: "Operador", value: "attendant" },
  { label: "Reportador", value: "reporter" },
];

const STATUS_OPTIONS = [
  { label: "Activo", value: "ACTIVE" },
  { label: "Suspendido", value: "SUSPENDED" },
];

const AdminEditUserPage = () => {
  const { userId = "" } = useParams();
  const { user, request } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
    role: "admin",
    status: "ACTIVE",
    password: "",
  });

  const tenant = user?.tenant;

  const userQuery = useQuery({
    queryKey: ["user", tenant, userId],
    enabled: Boolean(tenant && userId),
    queryFn: async () => request(ENDPOINTS.USER.GET, { tenant, id: userId }),
  });

  useEffect(() => {
    if (userQuery.data) {
      const data = userQuery.data as User;
      setFormState((prev) => ({
        ...prev,
        fullName: data.fullName ?? "",
        email: data.email,
        phone: data.phone ?? "",
        notes: data.notes ?? "",
        role: data.roles?.[0] ?? "admin",
        status: data.status ?? "ACTIVE",
      }));
    }
  }, [userQuery.data]);

  const updateUser = useMutation({
    mutationFn: async () => {
      if (!tenant) {
        throw new Error("No se encontró el tenant del usuario.");
      }
      const payload: Record<string, unknown> = {
        tenant,
        id: userId,
        fullName: formState.fullName,
        phone: formState.phone,
        notes: formState.notes,
        roles: [formState.role],
        status: formState.status,
      };
      if (formState.password.trim()) {
        payload.password = formState.password.trim();
      }
      return request(ENDPOINTS.USER.UPDATE, payload, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", tenant, userId] });
      navigate("/admin/users");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUser.mutate();
  };

  const isLoading = userQuery.isLoading;
  const isDisabled =
    !formState.fullName.trim() || updateUser.isPending || isLoading;

  return (
    <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-white p-8 shadow-2xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
          <p className="text-xl font-medium text-slate-800">
            Editar usuario Â· {formState.fullName || "Nuevo"}
          </p>
          <p className="text-sm text-slate-500">
            Actualiza la información de contacto, rol o estado del usuario.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full border border-slate-300 bg-white px-6 py-5 text-slate-700 hover:bg-slate-50"
        >
          <Link to="/admin/users">Volver al listado</Link>
        </Button>
      </header>

      {userQuery.isError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          No se pudo cargar la información del usuario.
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nombre completo
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200"
              value={formState.fullName}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  fullName: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Email institucional
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50"
              type="email"
              value={formState.email}
              disabled
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Rol</label>
            <Select
              value={formState.role}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="h-12 rounded-2xl border border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Estado
            </label>
            <Select
              value={formState.status}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="h-12 rounded-2xl border border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Teléfono
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200"
              value={formState.phone}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nueva contraseña (opcional)
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200"
              type="password"
              placeholder="â—â—â—â—â—â—â—â—"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Notas internas
          </label>
          <Textarea
            className="min-h-[140px] rounded-3xl border border-slate-200"
            value={formState.notes}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
          />
        </div>

        {updateUser.isError && (
          <p className="text-sm text-red-500">
            {(updateUser.error as Error)?.message ??
              "No se pudieron guardar los cambios."}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            asChild
            className="rounded-full border border-slate-300 bg-white px-6 py-5 text-slate-700 hover:bg-slate-100"
            type="button"
          >
            <Link to="/admin/users">Cancelar</Link>
          </Button>
          <Button
            className="rounded-full bg-slate-900 px-6 py-5 text-white hover:bg-slate-800"
            disabled={isDisabled}
            type="submit"
          >
            {updateUser.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditUserPage;
