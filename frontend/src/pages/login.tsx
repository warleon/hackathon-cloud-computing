import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-400 ">
      <div className="h-screen w-full max-w-md min-w-max bg-white p-8  flex flex-col justify-start items-center">
        <div className="space-y-1 text-center">
          <p className="text-4xl font-bold tracking-wide py-8">ALERTA UTEC</p>
          <p className="text-lg font-medium tracking-[0.4em] text-slate-800 py-8">
            LOGIN
          </p>
        </div>

        <form className="mt-10 space-y-6 w-full" onSubmit={handleSubmit}>
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
            className="h-12 w-full rounded-full bg-slate-900 text-base hover:bg-slate-800"
            type="submit"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
