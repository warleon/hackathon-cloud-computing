import { FormEvent, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

const USERS_MOCK = {
  u1: {
    name: "Mariana Torres",
    email: "mariana@utec.edu.pe",
    role: "Administrador",
    status: "Activo",
    notes: "Responsable del edificio principal.",
  },
  u2: {
    name: "Carlos Díaz",
    email: "cdiaz@utec.edu.pe",
    role: "Operador",
    status: "Activo",
    notes: "Responsable turno noche.",
  },
} as const;

const AdminEditUserPage = () => {
  const { userId = "u1" } = useParams();
  const fallbackUser = USERS_MOCK[userId as keyof typeof USERS_MOCK] ?? {
    name: "Usuario sin registrar",
    email: "sistema@utec.edu.pe",
    role: "Invitado",
    status: "Activo",
    notes: "",
  };

  const [fullName, setFullName] = useState(fallbackUser.name);
  const [email, setEmail] = useState(fallbackUser.email);
  const [role, setRole] = useState(fallbackUser.role);
  const [status, setStatus] = useState(fallbackUser.status);
  const [notes, setNotes] = useState(fallbackUser.notes);

  const pageTitle = useMemo(
    () => `Editar usuario · ${fullName || "Nuevo"}`,
    [fullName],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-sky-400 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-white p-8 shadow-2xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
            <p className="text-xl font-medium text-slate-800">{pageTitle}</p>
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

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Nombre completo
              </label>
              <Input
                className="h-12 rounded-2xl border border-slate-200"
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
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Rol
              </label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-12 rounded-2xl border border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Invitado">Invitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Estado
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 rounded-2xl border border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Notas internas
            </label>
            <Textarea
              className="min-h-[140px] rounded-3xl border border-slate-200"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

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
              type="submit"
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUserPage;
