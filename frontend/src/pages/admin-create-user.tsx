import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

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

const ROLE_OPTIONS = [
  { label: "Administrador", value: "admin" },
  { label: "Operador", value: "attendant" },
  { label: "Reportador", value: "reporter" },
];

const STATUS_OPTIONS = [
  { label: "Activo", value: "ACTIVE" },
  { label: "Suspendido", value: "SUSPENDED" },
];

const AdminCreateUserPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { request, user } = useAuthContext();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [status, setStatus] = useState("ACTIVE");

  const createUser = useMutation({
    mutationFn: async () => {
      if (!user?.tenant) {
        throw new Error("No se encontró el tenant del usuario.");
      }

      const payload = {
        tenant: user.tenant,
        fullName,
        email,
        phone,
        notes,
        password,
        roles: [role],
        status,
      };

      return request(ENDPOINTS.USER.CREATE, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/admin/users");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createUser.mutate();
  };

  const isDisabled =
    !fullName.trim() ||
    !email.trim() ||
    !password.trim() ||
    createUser.isLoading;

  return (
    <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-white p-8 shadow-2xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
          <p className="text-xl font-medium text-slate-700">
            Crear nuevo usuario
          </p>
          <p className="text-sm text-slate-500">
            Los administradores pueden asignar roles y dejar notas internas.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-slate-900 px-6 py-5 hover:bg-slate-800"
        >
          <Link to="/admin/users">Ver usuarios</Link>
        </Button>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nombre completo
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200"
              placeholder="Ej. Mariana Torres"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Email institucional
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200"
              placeholder="usuario@utec.edu.pe"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Rol asignado
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-12 rounded-2xl border border-slate-200 text-slate-700">
                <SelectValue placeholder="Selecciona un rol" />
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
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-12 rounded-2xl border border-slate-200 text-slate-700">
                <SelectValue placeholder="Estado" />
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
              Contraseña temporal
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200"
              placeholder="abcABC@123"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Teléfono
            </label>
            <Input
              className="h-12 rounded-2xl border border-slate-200"
              placeholder="+51 999 000 000"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Notas internas
          </label>
          <Textarea
            className="min-h-[140px] rounded-3xl border border-slate-200"
            placeholder="Información adicional sobre las responsabilidades o disponibilidad del usuario."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {createUser.isError && (
          <p className="text-sm text-red-500">
            {(createUser.error as Error)?.message ??
              "No se pudo crear el usuario."}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            className="rounded-full border border-slate-300 bg-white px-6 py-5 text-slate-700 hover:bg-slate-100"
            type="button"
            asChild
          >
            <Link to="/admin/users">Cancelar</Link>
          </Button>
          <Button
            className="rounded-full bg-slate-900 px-6 py-5 text-white hover:bg-slate-800"
            disabled={isDisabled}
            type="submit"
          >
            {createUser.isLoading ? "Guardando..." : "Guardar usuario"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateUserPage;
