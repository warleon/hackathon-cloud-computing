import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/hooks/auth/authContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tenant = String(formData.get("tenant") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!tenant || !email || !password) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await login(tenant, email, password);
      navigate("/reports");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("No se pudo iniciar sesión. Verifica tus datos.");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (isAuthenticated) navigate("/reports");
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-screen w-full max-w-md min-w-max bg-white p-8  flex flex-col justify-start items-center">
        <div className="space-y-1 text-center">
          <p className="text-4xl font-bold tracking-wide py-8">ALERTA UTEC</p>
          <p className="text-lg font-medium tracking-[0.4em] text-slate-800 py-8">
            LOGIN
          </p>
        </div>

        <form className="mt-10 space-y-6 w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="tenant">Institución</Label>
            <Input id="tenant" name="tenant" placeholder="Ej. utec" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="nombre.apellido@utec.edu.pe"
              type="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              placeholder="abcABC@!#123"
              type="password"
              required
            />
          </div>

          <Button
            className="h-12 w-full rounded-full bg-slate-900 text-base hover:bg-slate-800 disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Ingresando..." : "Sign In"}
          </Button>
          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
