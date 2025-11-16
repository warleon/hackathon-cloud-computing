import { FormEvent, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

const ROLE_OPTIONS = ["Administrador", "Operador", "Supervisor", "Invitado"];

const AdminCreateUserPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-sky-400 px-4 py-10">
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
          <Button asChild className="rounded-full bg-slate-900 px-6 py-5 hover:bg-slate-800">
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
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Teléfono
              </label>
              <Input
                className="h-12 rounded-2xl border border-slate-200"
                placeholder="+51 999 000 000"
                type="tel"
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
              type="submit"
            >
              Guardar usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUserPage;
