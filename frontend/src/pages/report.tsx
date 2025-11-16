import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronsUpDown, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const DEFAULT_INCIDENT_TYPES = [
  "Fuga de agua",
  "Incendio",
  "Robo o hurto",
  "Accidente personal",
  "Fallo eléctrico",
];

const LOCATION_CODES = [
  "A101 - Laboratorio",
  "A201 - Aula magna",
  "B305 - Pasadizo piso 3",
  "Biblioteca central",
  "Exteriores - Patio principal",
  "Parking subterráneo",
];

const ReportPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<File | null>(null);
  const [incidentTypes, setIncidentTypes] = useState(DEFAULT_INCIDENT_TYPES);
  const [incidentType, setIncidentType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, request } = useAuthContext();

  const isVideo = media?.type.startsWith("video/");

  useEffect(() => {
    if (!media) {
      setMediaPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(media);
    setMediaPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [media]);

  const updateMedia = (file: File) => {
    setMedia(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) updateMedia(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) updateMedia(file);
  };

  const createIncident = useMutation({
    mutationFn: async () => {
      if (!user?.tenant) {
        throw new Error("No se encontró el tenant del usuario.");
      }
      const payload = {
        tenant: user.tenant,
        title: incidentType,
        creator: user.email,
        location,
        media: media?.name ?? "",
        description,
        state: "PENDING",
      };
      return request(ENDPOINTS.INCIDENT.CREATE, payload);
    },
    onSuccess: () => {
      setIncidentType("");
      setLocation("");
      setDescription("");
      setMedia(null);
      setMediaPreview(null);
      setFormError(null);
      navigate("/reports");
    },
  });

  const matchingTypes = incidentTypes.filter((type) =>
    type.toLowerCase().includes(typeSearch.toLowerCase())
  );

  const showCreateOption =
    typeSearch.length > 0 &&
    !incidentTypes.some(
      (type) => type.toLowerCase() === typeSearch.toLowerCase()
    );

  const handleCreateIncidentType = () => {
    const trimmed = typeSearch.trim();
    if (!trimmed) return;
    setIncidentTypes((prev) => [...prev, trimmed]);
    setIncidentType(trimmed);
    setTypeSearch("");
    setTypeSelectorOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!incidentType) {
      setFormError("Selecciona o crea un tipo de incidente.");
      return;
    }
    if (!location) {
      setFormError("Selecciona una ubicación.");
      return;
    }
    setFormError(null);
    createIncident.mutate();
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[2.5rem] bg-white p-8 shadow-2xl">
      <header className="space-y-1 text-left">
        <p className="text-3xl font-semibold text-slate-900">ALERTA UTEC</p>
        <p className="text-base text-slate-600">
          Reporta incidentes críticos con evidencia multimedia.
        </p>
      </header>

      <input
        className="hidden"
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFileChange}
      />

      <div
        className="rounded-[2rem] border-2 border-sky-200 bg-sky-50 p-6 text-center"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-lg font-medium text-slate-900">
          Ingrese multimedia como evidencia del incidente
        </p>
        <div className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-4 border-dashed border-yellow-300 bg-yellow-100/60 px-8 py-10">
          <span className="text-base font-semibold text-slate-800">
            Seleccionar archivo
          </span>
          <Camera className="mt-4 h-12 w-12 text-slate-800" />
          <p className="mt-2 text-sm text-slate-700">
            Arrastra, sube o captura multimedia
          </p>
          {media && (
            <p className="mt-3 text-xs text-slate-600">
              Archivo seleccionado: {media.name}
            </p>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Se admite imagen o video para la descripción.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Tipo de incidente
            </label>
            <Popover open={typeSelectorOpen} onOpenChange={setTypeSelectorOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="h-12 w-full justify-between rounded-full border border-slate-200 bg-white text-base font-normal text-slate-700"
                  role="combobox"
                  type="button"
                  aria-expanded={typeSelectorOpen}
                >
                  {incidentType || "Buscar o crear"}
                  <ChevronsUpDown className="ml-2 h-5 w-5 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full max-w-lg p-0">
                <Command>
                  <CommandInput
                    placeholder="Escribe para buscar"
                    value={typeSearch}
                    onValueChange={setTypeSearch}
                  />
                  <CommandEmpty>No se encontraron incidentes.</CommandEmpty>
                  <CommandGroup>
                    {matchingTypes.map((type) => (
                      <CommandItem
                        key={type}
                        onSelect={() => {
                          setIncidentType(type);
                          setTypeSearch("");
                          setTypeSelectorOpen(false);
                        }}
                      >
                        {type}
                      </CommandItem>
                    ))}
                    {showCreateOption && (
                      <CommandItem onSelect={handleCreateIncidentType}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear â€œ{typeSearch}â€
                      </CommandItem>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Ubicación
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-12 rounded-full border border-slate-200 text-base text-slate-700">
                <SelectValue placeholder="Buscar" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Descripción y evidencia
          </label>
          <div className="relative">
            <Textarea
              className="min-h-[150px] rounded-3xl border-2 border-slate-200 pr-44 text-base"
              placeholder="Describe lo que ocurrió y agrega detalles relevantes..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            {mediaPreview && (
              <div className="pointer-events-none absolute right-6 top-6 flex h-24 w-32 items-center justify-center overflow-hidden rounded-2xl border border-slate-300 bg-white">
                {isVideo ? (
                  <video
                    className="h-full w-full object-cover"
                    src={mediaPreview}
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                    src={mediaPreview}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {formError && <p className="text-sm text-red-500">{formError}</p>}
        {createIncident.isError && (
          <p className="text-sm text-red-500">
            {(createIncident.error as Error)?.message ??
              "No se pudo registrar el incidente."}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            className="rounded-full bg-slate-900 px-10 py-6 text-lg font-semibold text-white hover:bg-slate-800"
            disabled={createIncident.isPending}
            type="submit"
          >
            {createIncident.isPending ? "Enviando..." : "Enviar reporte"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportPage;
